export function getSessionId() {
  let sessionId = sessionStorage.getItem('@Othello:sessionId')

  if (sessionId == null) {
    sessionId = String(Math.round(Math.random() * 100000))
    sessionStorage.setItem('@Othello:sessionId', sessionId)
  }

  return sessionId
}