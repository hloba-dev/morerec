/**
 * Минимальный срез Permissions API — чтобы функцию можно было
 * тестировать в Node без настоящего `navigator`.
 */
export interface PermissionsLike {
  query(descriptor: { name: string }): Promise<{ state: string }>;
}

/**
 * Пользователь навсегда запретил чтение буфера (Chrome/Android: «Блокировать»)?
 *
 * Нужна, чтобы отличить это от обычной отмены: iOS Safari и Firefox вместо
 * запроса разрешения показывают системную подсказку «Вставить», и если
 * пользователь её закрыл, `readText()` тоже отклоняется с NotAllowedError.
 * В этих браузерах `clipboard-read` в Permissions API не поддерживается,
 * `query` бросает — и мы честно отвечаем «не запрещено».
 */
export async function isClipboardReadDenied(
  permissions: PermissionsLike | undefined,
): Promise<boolean> {
  if (!permissions) return false;
  try {
    const status = await permissions.query({ name: 'clipboard-read' });
    return status.state === 'denied';
  } catch {
    return false;
  }
}
