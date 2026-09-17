/**
 * PAROXISMO - SRD COMPENDIUM
 * Módulo: Otimizador de Imagens (Canvas Compression Pipeline)
 * Garante limite de tamanho e comprime imagens pesadas (ex.: 5MB) para ~35KB-65KB,
 * preservando nitidez sem sobrecarregar o localStorage.
 */

export class ImageOptimizer {
  static MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

  /**
   * Valida se o arquivo de imagem está dentro dos limites permitidos.
   * @param {File} file 
   * @returns {{ valid: boolean, error?: string }}
   */
  static validateFile(file) {
    if (!file) {
      return { valid: false, error: "Nenhum arquivo selecionado." };
    }

    if (!file.type.startsWith('image/')) {
      return { valid: false, error: "O arquivo selecionado não é uma imagem válida (JPG, PNG, WebP)." };
    }

    if (file.size > this.MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return { 
        valid: false, 
        error: `Arquivo muito grande (${sizeMB} MB). O limite máximo de envio é de 5 MB.` 
      };
    }

    return { valid: true };
  }

  /**
   * Comprime e redimensiona a imagem usando um Canvas off-screen.
   * @param {File} file 
   * @param {Object} options 
   * @param {number} [options.maxWidth=600] 
   * @param {number} [options.maxHeight=750] 
   * @param {number} [options.quality=0.82] 
   * @returns {Promise<string>} Base64 Data URL otimizada
   */
  static compressImage(file, options = {}) {
    const {
      maxWidth = 600,
      maxHeight = 750,
      quality = 0.82
    } = options;

    return new Promise((resolve, reject) => {
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return reject(new Error(validation.error));
      }

      const reader = new FileReader();

      reader.onerror = () => {
        reject(new Error("Erro ao ler o arquivo de imagem."));
      };

      reader.onload = (e) => {
        const img = new Image();

        img.onerror = () => {
          reject(new Error("Não foi possível carregar a imagem para processamento."));
        };

        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Cálculo proporcional de escala
          if (width > maxWidth || height > maxHeight) {
            const ratioW = maxWidth / width;
            const ratioH = maxHeight / height;
            const scale = Math.min(ratioW, ratioH);

            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }

          // Renderização no Canvas off-screen
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          // Suavização bilinear para manter alta qualidade ao reduzir
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Fundo preto diegético caso haja áreas transparentes convertidas em JPEG
          ctx.fillStyle = '#050609';
          ctx.fillRect(0, 0, width, height);

          // Desenho da imagem redimensionada
          ctx.drawImage(img, 0, 0, width, height);

          // Exportação comprimida em JPEG (0.82 oferece excelente fidelidade e peso minúsculo)
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);

          // Log informativo no console
          const originalKb = (file.size / 1024).toFixed(1);
          const compressedKb = ((optimizedDataUrl.length * 0.75) / 1024).toFixed(1);
          console.log(`[ImageOptimizer] Imagem otimizada: ${originalKb} KB ➔ ${compressedKb} KB (${width}x${height}px)`);

          resolve(optimizedDataUrl);
        };

        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Atalho para otimização de retrato do Agente
   */
  static optimizeAvatar(file) {
    return this.compressImage(file, {
      maxWidth: 380,
      maxHeight: 480,
      quality: 0.80
    });
  }

  /**
   * Atalho para otimização de ilustração de Armas
   */
  static optimizeWeaponImage(file) {
    return this.compressImage(file, {
      maxWidth: 640,
      maxHeight: 400,
      quality: 0.82
    });
  }
}
