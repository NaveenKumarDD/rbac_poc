const TYPE_ORDER = ['WEB', 'MOBILE']

export function formatPermissionLabels(permissionIds, permissions) {
  if (!permissionIds?.length) return '—'

  return permissionIds
    .map((id) => {
      const permission = permissions.find((item) => item.id === id)
      if (!permission) return `#${id}`

      const label = permission.name || 'Unnamed permission'
      return permission.tag ? `${label} · ${permission.tag}` : label
    })
    .join(', ')
}

export function groupPermissionsByBundleAndType(permissions) {
  const grouped = permissions.reduce((acc, permission) => {
    const bundleName = permission.bundle_name?.trim() || 'Other'
    const type = permission.type?.trim().toUpperCase() || 'Other'

    if (!acc[bundleName]) acc[bundleName] = {}
    if (!acc[bundleName][type]) acc[bundleName][type] = []

    acc[bundleName][type].push(permission)
    return acc
  }, {})

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([bundleName, typesMap]) => ({
      bundleName,
      types: Object.entries(typesMap)
        .sort(([a], [b]) => {
          const indexA = TYPE_ORDER.indexOf(a)
          const indexB = TYPE_ORDER.indexOf(b)

          if (indexA === -1 && indexB === -1) return a.localeCompare(b)
          if (indexA === -1) return 1
          if (indexB === -1) return -1
          return indexA - indexB
        })
        .map(([type, items]) => ({
          type,
          items: items.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0),
        })),
    }))
}
