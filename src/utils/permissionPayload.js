export function normalizeRbacPart(value) {
  return String(value).trim().replace(/\s+/g, '_').toUpperCase()
}

export function buildPermissionPayload({ name, bundleName, type, tag }) {
  const rbacParts = [name, bundleName, type, tag].map(normalizeRbacPart)

  return {
    rbac: rbacParts.join('_'),
    type,
    tag,
    name: name.trim(),
  }
}

export function buildCreatePermissionRequest({ name, bundleId, type, tag }, roleBundles) {
  const bundle = roleBundles.find((item) => String(item.id) === String(bundleId))
  const basePayload = buildPermissionPayload({
    name,
    bundleName: bundle?.name ?? '',
    type,
    tag,
  })

  return {
    ...basePayload,
    bundle_id: Number(bundleId),
  }
}
