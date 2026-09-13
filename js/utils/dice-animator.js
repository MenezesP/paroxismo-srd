/**
 * PAROXISMO - SRD COMPENDIUM
 * Módulo: Motor de Dados 3D Real com Física WebGL (Three.js + Cannon.js)
 * Arquitetura idêntica à do Foundry VTT (Dice So Nice / byWulf ThreeJS Dice).
 * 
 * - Renderizador Three.js transparente com iluminação direcional e sombras dinâmicas.
 * - Simulação de corpos rígidos poliedrais convexos no Cannon.js.
 * - Suporte completo a d20, d12, d10, d8, d6 e d4.
 * - Texturas em pedra obsidiana e carmesim litúrgico com numeração de alto contraste.
 * - Resolução da Promise EXCLUSIVAMENTE após repouso físico do dado.
 */

import { soundFX } from './sound-fx.js?v=sound_v2';
import { 
  DiceManager, 
  DiceD20, 
  DiceD12, 
  DiceD10, 
  DiceD8, 
  DiceD6, 
  DiceD4 
} from '../vendor/three-dice.js?v=phys_v12';

export class DiceAnimator {
  static initialized = false;
  static canvas = null;
  static renderer = null;
  static scene = null;
  static camera = null;
  static world = null;
  static walls = [];
  static activeDice = [];
  static isLoopRunning = false;
  static animFrameId = null;

  /**
   * Inicializa o palco WebGL e o mundo físico Cannon de forma lazy
   */
  static initEngine() {
    if (this.initialized) return;

    const THREE = window.THREE;
    const CANNON = window.CANNON;

    if (!THREE || !CANNON) {
      console.warn("Three.js ou Cannon.js não encontrados no escopo global.");
      return;
    }

    // 1. Canvas WebGL de tela cheia translúcido
    this.canvas = document.getElementById('paroxismo-3d-dice-canvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'paroxismo-3d-dice-canvas';
      this.canvas.className = 'fixed inset-0 pointer-events-none z-[9990] select-none w-full h-full';
      document.body.appendChild(this.canvas);
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;

    // 2. Renderizador Three.js
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 3. Cena e Câmera de Perspectiva Superior (Mesa de RPG)
    this.scene = new THREE.Scene();

    const fov = 42;
    this.camera = new THREE.PerspectiveCamera(fov, width / height, 1, 2500);
    if (isMobile) {
      // No celular em pé (portrait), afasta e eleva a câmera para ter visão completa da mesa
      this.camera.position.set(0, 320, 220);
    } else {
      this.camera.position.set(0, 220, 160);
    }
    this.camera.lookAt(0, 10, 0);
    this.scene.add(this.camera);

    // 4. Iluminação Cinematográfica de Mesa
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(120, 600, 250);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 50;
    dirLight.shadow.camera.far = 1000;
    const d = 350;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.001;
    this.scene.add(dirLight);

    // Luz de Destaque Mística Vermelha do Paroxismo
    const accentLight = new THREE.PointLight(0xe21b23, 1.2, 800);
    accentLight.position.set(-150, 220, 0);
    this.scene.add(accentLight);

    // 5. Plano Invisível Coletor de Sombras (Shadow Catcher)
    const floorGeo = new THREE.PlaneGeometry(3000, 3000);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.55 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);

    // 6. Mundo de Física Rígida Cannon.js
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82 * 110, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.solver.iterations = 18;

    DiceManager.setWorld(this.world);

    // Chão de Colisão Física
    const floorBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: DiceManager.floorBodyMaterial
    });
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    floorBody.position.set(0, 0, 0);
    this.world.addBody(floorBody);

    // Paredes Invisíveis de Contenção (para o dado não sair da tela)
    this.buildBoundaryWalls();

    // Redimensionamento de Janela
    window.addEventListener('resize', () => this.handleResize());

    this.initialized = true;
  }

  /**
   * Constrói barreiras perimetrais na física para rebater os dados
   */
  static buildBoundaryWalls() {
    const CANNON = window.CANNON;
    if (!this.world) return;

    // Remove paredes antigas caso seja uma reconstrução de resize
    if (this.walls && this.walls.length > 0) {
      this.walls.forEach(w => {
        try { this.world.remove(w); } catch (e) {}
      });
      this.walls = [];
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    const aspect = width / height;

    // No celular, as paredes laterais devem ser bem mais próximas do centro para o dado nunca sair da tela
    const boundX = isMobile ? Math.max(34, Math.round(50 * Math.min(1, aspect / 0.5))) : 140;
    const boundZ = isMobile ? 120 : 95;

    // Parede Esquerda
    const wallL = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: DiceManager.barrierBodyMaterial });
    wallL.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
    wallL.position.set(-boundX, 0, 0);
    this.world.addBody(wallL);
    this.walls.push(wallL);

    // Parede Direita
    const wallR = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: DiceManager.barrierBodyMaterial });
    wallR.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
    wallR.position.set(boundX, 0, 0);
    this.world.addBody(wallR);
    this.walls.push(wallR);

    // Parede Superior (Fundo)
    const wallTop = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: DiceManager.barrierBodyMaterial });
    wallTop.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0);
    wallTop.position.set(0, 0, -boundZ);
    this.world.addBody(wallTop);
    this.walls.push(wallTop);

    // Parede Inferior (Frente)
    const wallBottom = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: DiceManager.barrierBodyMaterial });
    wallBottom.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI);
    wallBottom.position.set(0, 0, boundZ);
    this.world.addBody(wallBottom);
    this.walls.push(wallBottom);
  }

  static handleResize() {
    if (!this.initialized) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;

    this.camera.aspect = width / height;
    if (isMobile) {
      this.camera.position.set(0, 320, 220);
    } else {
      this.camera.position.set(0, 220, 160);
    }
    this.camera.lookAt(0, 10, 0);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    this.buildBoundaryWalls();
  }

  /**
   * Arremessa um dado 3D na mesa virtual com física newtoniana real e aguarda seu repouso físico
   */
  static roll({
    sides = 20,
    quantity = 1,
    label = "TESTE"
  }) {
    return new Promise((resolve) => {
      this.initEngine();

      const THREE = window.THREE;
      const CANNON = window.CANNON;

      const d = parseInt(sides, 10) || 20;
      const count = Math.max(1, Math.min(10, parseInt(quantity, 10) || 1));

      if (!THREE || !CANNON || !this.world) {
        // Fallback defensivo caso WebGL não esteja disponível
        const fallbackRolls = [];
        for (let i = 0; i < count; i++) {
          fallbackRolls.push(Math.floor(Math.random() * d) + 1);
        }
        const fallbackSum = fallbackRolls.reduce((a, b) => a + b, 0);
        resolve({
          rolledValue: fallbackRolls[0],
          rolls: fallbackRolls,
          sum: fallbackSum,
          isCrit: d === 20 && fallbackRolls.includes(20),
          isFumble: d === 20 && fallbackRolls.every(r => r === 1),
          sides: d,
          label
        });
        return;
      }

      // Banner flutuante do teste
      const labelBadge = document.createElement('div');
      labelBadge.id = 'dice-3d-floating-label';
      labelBadge.className = 'fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-2 bg-[#07090e]/95 border-2 border-[#e21b23] text-white shadow-[0_0_20px_rgba(226,27,35,0.4)] text-xs font-mono font-black uppercase tracking-widest animate-fadeIn select-none shadow-2xl flex items-center';
      labelBadge.innerHTML = `<span>[ ${label.toUpperCase()} ]</span>`;
      document.body.appendChild(labelBadge);

      const batch = {
        quantity: count,
        remaining: count,
        results: [],
        sides: d,
        label,
        labelBadge,
        resolveCallback: resolve,
        resolved: false
      };

      const isMobile = window.innerWidth < 768;

      // Cores Litúrgicas do PAROXISMO (Tamanho proporcional em telas mobile)
      const baseSize = d === 20 ? 32 : d === 6 ? 28 : d === 8 ? 30 : d === 12 ? 30 : 28;
      const diceOptions = {
        size: isMobile ? Math.round(baseSize * 0.78) : baseSize,
        backColor: '#0b0f19',
        fontColor: '#ff333d'
      };

      // Som tátil de arremesso inicial
      soundFX.playDiceRoll();

      for (let i = 0; i < count; i++) {
        let dieInstance;
        switch (d) {
          case 4:
            dieInstance = new DiceD4(diceOptions);
            break;
          case 6:
            dieInstance = new DiceD6(diceOptions);
            break;
          case 8:
            dieInstance = new DiceD8(diceOptions);
            break;
          case 10:
            dieInstance = new DiceD10(diceOptions);
            break;
          case 12:
            dieInstance = new DiceD12(diceOptions);
            break;
          case 20:
          default:
            dieInstance = new DiceD20(diceOptions);
            break;
        }

        const dieMesh = dieInstance.getObject();
        this.scene.add(dieMesh);

        // Espalhamento de posições para múltiplos dados não interpenetrarem no spawn
        const spawnSide = (i % 2 === 0) ? 1 : -1;
        const spreadOffsetX = (i - (count - 1) / 2) * (isMobile ? 20 : 34);
        const spreadOffsetZ = (Math.random() - 0.5) * (isMobile ? 20 : 30);
        const spreadOffsetY = i * 18;

        const baseStartX = isMobile 
          ? spawnSide * (12 + Math.random() * 16)
          : spawnSide * (70 + Math.random() * 40);
        const startX = baseStartX + spreadOffsetX;
        const startY = (isMobile ? 150 : 130) + spreadOffsetY + Math.random() * 20;
        const startZ = (isMobile ? 15 : 30) + spreadOffsetZ;

        dieMesh.position.set(startX, startY, startZ);
        dieMesh.quaternion.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          1
        ).normalize();

        dieInstance.updateBodyFromMesh();

        // Forças físicas de arremesso com dispersão direcional
        const forceMult = isMobile ? 1.15 : 1.5;
        const spreadVelX = (Math.random() - 0.5) * 25;
        const spreadVelZ = (Math.random() - 0.5) * 25;
        dieMesh.body.velocity.set(
          -startX * (forceMult + Math.random() * 0.25) + spreadVelX,
          -90 - Math.random() * 30,
          -startZ * (forceMult + Math.random() * 0.25) + spreadVelZ
        );

        dieMesh.body.angularVelocity.set(
          (Math.random() * 35 + 20) * (Math.random() > 0.5 ? 1 : -1),
          (Math.random() * 35 + 20) * (Math.random() > 0.5 ? 1 : -1),
          (Math.random() * 35 + 20) * (Math.random() > 0.5 ? 1 : -1)
        );

        // Monitoramento de colisões para som de quique
        let lastSoundTime = 0;
        const onCollide = (e) => {
          const now = performance.now();
          const contactVelocity = Math.abs(e.contact.getImpactVelocityAlongNormal());
          if (contactVelocity > 35 && now - lastSoundTime > 110) {
            lastSoundTime = now;
            soundFX.playDiceRoll();
          }
        };

        dieMesh.body.addEventListener('collide', onCollide);

        // Estado do Dado Ativo
        const dieData = {
          dieInstance,
          dieMesh,
          onCollide,
          stableCount: 0,
          isFinished: false,
          startTime: performance.now(),
          batch,
          resolveCallback: resolve,
          labelBadge,
          sides: d,
          label
        };

        this.activeDice.push(dieData);
      }

      // Inicia loop de animação caso não esteja ativo
      if (!this.isLoopRunning) {
        this.startLoop();
      }
    });
  }

  static startLoop() {
    this.isLoopRunning = true;
    let lastTime = performance.now();

    const animate = (now) => {
      this.animFrameId = requestAnimationFrame(animate);

      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;

      // Avança física
      this.world.step(dt || 1 / 60);

      // Atualiza cada dado ativo
      for (let i = this.activeDice.length - 1; i >= 0; i--) {
        const d = this.activeDice[i];
        d.dieInstance.updateMeshFromBody();

        // Checagem de repouso físico real: o dado deve parar TOTALMENTE de se mover e girar
        if (!d.isFinished) {
          const v = d.dieMesh.body.velocity;
          const av = d.dieMesh.body.angularVelocity;
          const speed = v.length();
          const angSpeed = av.length();

          // Repouso estático absoluto: velocidade linear < 0.25 e angular < 0.25
          // Exige 28 frames consecutivos (~460ms) de repouso verdadeiro após pelo menos 800ms de rolagem
          if (speed < 0.25 && angSpeed < 0.25 && (now - d.startTime > 800)) {
            d.stableCount++;
          } else {
            d.stableCount = 0;
          }

          // Só finaliza quando o dado parar TOTALMENTE de forma física e natural (sem corte abrupto)
          // O limite de 10 segundos existe unicamente como proteção contra falhas catastróficas de simulação
          if (d.stableCount >= 28 || (now - d.startTime > 10000)) {
            d.isFinished = true;
            this.handleDieSettled(d);
          }
        }
      }

      // Renderiza cena WebGL
      this.renderer.render(this.scene, this.camera);
    };

    this.animFrameId = requestAnimationFrame(animate);
  }

  /**
   * Chamado quando o dado físico para completamente de se mover
   */
  static handleDieSettled(dieData) {
    soundFX.playRuneClick();

    // 0. Imobiliza completamente o corpo físico no ponto exato de repouso
    if (dieData.dieMesh && dieData.dieMesh.body) {
      dieData.dieMesh.body.velocity.set(0, 0, 0);
      dieData.dieMesh.body.angularVelocity.set(0, 0, 0);
      dieData.dieMesh.body.sleep();
    }
    dieData.dieInstance.updateMeshFromBody();

    // 1. LEITURA FÍSICA GENUÍNA DA FACE SUPERIOR (Sem qualquer teletransporte ou troca de textura!)
    let physicalValue = dieData.dieInstance.getUpsideValue();
    if (dieData.sides === 10 && physicalValue === 0) {
      physicalValue = 10;
    }
    physicalValue = Math.max(1, Math.min(dieData.sides, physicalValue));

    const isCrit = (dieData.sides === 20 && physicalValue === 20);
    const isFumble = (dieData.sides === 20 && physicalValue === 1);

    // 2. Criação de Círculo Ritualístico de Contenção perfeitamente concêntrico sob o dado
    const THREE = window.THREE;
    const auraColor = isCrit ? 0x06b6d4 : isFumble ? 0xff333d : 0xe21b23;
    
    const auraGroup = new THREE.Group();
    auraGroup.position.set(dieData.dieMesh.position.x, 0.4, dieData.dieMesh.position.z);

    const outerGeo = new THREE.RingGeometry(29, 31, 64);
    const outerMat = new THREE.MeshBasicMaterial({
      color: auraColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    outerMesh.rotation.x = -Math.PI / 2;
    auraGroup.add(outerMesh);

    const innerGeo = new THREE.RingGeometry(23, 24.5, 64);
    const innerMat = new THREE.MeshBasicMaterial({
      color: auraColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    innerMesh.rotation.x = -Math.PI / 2;
    auraGroup.add(innerMesh);

    this.scene.add(auraGroup);
    dieData.auraMesh = auraGroup;
    dieData.auraMats = [outerMat, innerMat];
    dieData.auraGeos = [outerGeo, innerGeo];

    // 3. Resolução por Lote (Batching) para Suporte Completo a Múltiplos Dados Físicos 3D
    if (dieData.batch) {
      const batch = dieData.batch;
      batch.results.push(physicalValue);
      batch.remaining--;

      if (batch.remaining <= 0 && !batch.resolved) {
        batch.resolved = true;
        const count = batch.quantity;
        const sides = batch.sides;
        const results = batch.results;
        const sum = results.reduce((a, b) => a + b, 0);
        const isCritBatch = (sides === 20 && results.includes(20));
        const isFumbleBatch = (sides === 20 && results.every(r => r === 1));

        if (batch.labelBadge) {
          if (count === 1) {
            if (isCritBatch) {
              batch.labelBadge.className = batch.labelBadge.className.replace('border-[#e21b23]', 'border-[#06b6d4]').replace('text-white', 'text-[#06b6d4]');
              batch.labelBadge.innerHTML += ` <span class="ml-2 px-2 py-0.5 bg-[#06b6d4] text-black font-black">[ 20 CRÍTICO ]</span>`;
            } else if (isFumbleBatch) {
              batch.labelBadge.className = batch.labelBadge.className.replace('border-[#e21b23]', 'border-[#ff333d]').replace('text-white', 'text-[#ff333d]');
              batch.labelBadge.innerHTML += ` <span class="ml-2 px-2 py-0.5 bg-[#ff333d] text-white font-black">[ 1 FALHA ]</span>`;
            } else {
              batch.labelBadge.innerHTML += ` <span class="ml-2 px-2 py-0.5 bg-[#e21b23] text-white font-black">[ RESULTADO: ${results[0]} ]</span>`;
            }
          } else {
            // Múltiplos dados rolados juntos
            if (isCritBatch) {
              batch.labelBadge.className = batch.labelBadge.className.replace('border-[#e21b23]', 'border-[#06b6d4]').replace('text-white', 'text-[#06b6d4]');
              batch.labelBadge.innerHTML += ` <span class="ml-2 px-2 py-0.5 bg-[#06b6d4] text-black font-black">[ ${results.join(' + ')} = ${sum} CRÍTICO! ]</span>`;
            } else if (isFumbleBatch) {
              batch.labelBadge.className = batch.labelBadge.className.replace('border-[#e21b23]', 'border-[#ff333d]').replace('text-white', 'text-[#ff333d]');
              batch.labelBadge.innerHTML += ` <span class="ml-2 px-2 py-0.5 bg-[#ff333d] text-white font-black">[ ${results.join(' + ')} = ${sum} FALHA! ]</span>`;
            } else {
              batch.labelBadge.innerHTML += ` <span class="ml-2 px-2 py-0.5 bg-[#e21b23] text-white font-black">[ ${results.join(' + ')} = ${sum} ]</span>`;
            }
          }

          setTimeout(() => {
            batch.labelBadge?.remove();
          }, 2500);
        }

        batch.resolveCallback({
          rolledValue: results[0],
          rolls: results,
          sum,
          isCrit: isCritBatch,
          isFumble: isFumbleBatch,
          sides,
          label: batch.label
        });
      }
    } else {
      if (dieData.labelBadge) {
        if (isCrit) {
          dieData.labelBadge.className = dieData.labelBadge.className.replace('border-[#e21b23]', 'border-[#06b6d4]').replace('text-white', 'text-[#06b6d4]');
          dieData.labelBadge.innerHTML += ` <span class="ml-2 px-2 py-0.5 bg-[#06b6d4] text-black font-black">[ 20 CRÍTICO ]</span>`;
        } else if (isFumble) {
          dieData.labelBadge.className = dieData.labelBadge.className.replace('border-[#e21b23]', 'border-[#ff333d]').replace('text-white', 'text-[#ff333d]');
          dieData.labelBadge.innerHTML += ` <span class="ml-2 px-2 py-0.5 bg-[#ff333d] text-white font-black">[ 1 FALHA ]</span>`;
        } else {
          dieData.labelBadge.innerHTML += ` <span class="ml-2 px-2 py-0.5 bg-[#e21b23] text-white font-black">[ RESULTADO: ${physicalValue} ]</span>`;
        }
        setTimeout(() => {
          dieData.labelBadge?.remove();
        }, 2500);
      }

      dieData.resolveCallback({
        rolledValue: physicalValue,
        rolls: [physicalValue],
        sum: physicalValue,
        isCrit,
        isFumble,
        sides: dieData.sides,
        label: dieData.label
      });
    }

    // 6. Mantém o dado 3D descansando na mesa por 4.0 segundos (estilo Foundry VTT)
    setTimeout(() => {
      const fadeStart = performance.now();
      const fadeDuration = 700;

      const fadeInterval = setInterval(() => {
        const elapsed = performance.now() - fadeStart;
        const p = Math.min(elapsed / fadeDuration, 1);
        
        outerMat.opacity = (1 - p) * 0.85;
        innerMat.opacity = (1 - p) * 0.55;

        if (Array.isArray(dieData.dieMesh.material)) {
          dieData.dieMesh.material.forEach(m => {
            m.transparent = true;
            m.opacity = 1 - p;
          });
        }

        if (p >= 1) {
          clearInterval(fadeInterval);
          this.cleanupDie(dieData);
        }
      }, 30);

    }, 4000);
  }

  static cleanupDie(dieData) {
    // Remove listeners
    dieData.dieMesh.body?.removeEventListener('collide', dieData.onCollide);

    // Remove do Three.js e Cannon.js
    this.scene.remove(dieData.dieMesh);
    if (dieData.auraMesh) {
      this.scene.remove(dieData.auraMesh);
      dieData.auraGeos?.forEach(g => g.dispose());
      dieData.auraMats?.forEach(m => m.dispose());
    }
    this.world.remove(dieData.dieMesh.body);

    // Remove do array de ativos
    const idx = this.activeDice.indexOf(dieData);
    if (idx !== -1) {
      this.activeDice.splice(idx, 1);
    }

    // Se não houver mais dados ativos, desativa o loop para economizar 100% de GPU/CPU
    if (this.activeDice.length === 0) {
      this.isLoopRunning = false;
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      this.renderer.clear();
    }
  }
}

if (typeof window !== 'undefined') {
  window.DiceAnimator = DiceAnimator;
}
