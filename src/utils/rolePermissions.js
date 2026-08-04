export function unionRolePermissionIds(roleIds, userRoles) {
  const ids = roleIds.flatMap((roleId) => {
    const role = userRoles.find((item) => item.id === roleId)
    return (role?.permissions ?? []).map(Number)
  })

  return [...new Set(ids.filter((id) => Number.isFinite(id)))]
}
