// Тип профиля для проверки полноты заполнения
export type ProfileLike = {
    phone?: string | null
    position?: string | null
    company?: string | null
    strongSkills?: string | null
  }
  
  /**
   * Проверка, что профиль пользователя заполнен
   */
  export function isProfileComplete(profile: ProfileLike | null | undefined): boolean {
    if (!profile) return false
  
    return Boolean(
      profile.phone?.trim() &&
      profile.position?.trim() &&
      profile.company?.trim() &&
      profile.strongSkills?.trim()
    )
  }
  