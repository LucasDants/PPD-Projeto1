export function getSessionId(roomId: string) {
  let sessionId = sessionStorage.getItem(`@Othello:${roomId}:sessionId`)

  if (sessionId == null) {
    sessionId = String(Math.round(Math.random() * 100000))
    sessionStorage.setItem(`@Othello:${roomId}:sessionId`, sessionId)
  }

  return sessionId
}