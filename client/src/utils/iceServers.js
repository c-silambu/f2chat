export const getIceServers = () => {
  const stun = import.meta.env.VITE_STUN_SERVER || 'stun:stun.l.google.com:19302';
  const turnServer = import.meta.env.VITE_TURN_SERVER;
  const turnUsername = import.meta.env.VITE_TURN_USERNAME;
  const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL;

  const servers = [
    { urls: stun },
    { urls: 'stun:stun1.l.google.com:19302' }
  ];

  if (turnServer) {
    servers.push({
      urls: turnServer,
      username: turnUsername || '',
      credential: turnCredential || ''
    });
  }

  return {
    iceServers: servers,
    iceCandidatePoolSize: 10
  };
};
