export default function buildEngine() {
  return {
    subscribe(label, cb) {
      cb(1);
    }
  };
}

