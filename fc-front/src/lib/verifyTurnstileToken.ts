// utils/verifyTurnstileToken.ts

export async function verifyTurnstileToken(
  token: string,
): Promise<{ success: boolean; data?: unknown }> {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await response.json()
    return { success: response.ok && data.success, data }
  } catch (error) {
    console.error('Error verifying Turnstile token:', error)
    return { success: false }
  }
}
