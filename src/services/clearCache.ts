/**
 * 清空应用本地缓存
 * 仅清除可重新生成的缓存数据，不影响登录状态与用户设置（如 API 密钥、语言）
 */

import { clearAllScriptCaches } from './scriptInit';
import { clearVideoCache } from './videoGeneration';
import { clearAllMembershipCache } from './membershipCache';

export async function clearAppCache(): Promise<void> {
  await clearAllScriptCaches();
  await clearVideoCache();
  await clearAllMembershipCache();
}
