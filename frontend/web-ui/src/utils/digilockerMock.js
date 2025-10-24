export function authenticateVoter() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: 'Alice Sharma',
        vid: 'VID12345678',
        dob: '1995-08-15',
      });
    }, 1000);
  });
}
