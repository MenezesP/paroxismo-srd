export default function handler(req, res) {
  res.status(200).json({ status: "online", app: "PAROXISMO SRD & Discord Activity", timestamp: new Date().toISOString() });
}