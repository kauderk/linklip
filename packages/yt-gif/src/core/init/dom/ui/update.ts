export async function TryUpdateSettingsBlockValue(directSettingsKey: string, replaceWith: string) {
  await tryGetDirectSetting(directSettingsKey)?.UpdateSettingsBlockValue?.(replaceWith)
}

export function tryGetDirectSetting(directSettingsKey: string) {
  return window?.YT_GIF_DIRECT_SETTINGS?.get?.(directSettingsKey)
}
