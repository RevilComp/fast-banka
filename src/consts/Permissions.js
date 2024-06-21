const permissions = {
  BANK_ACCOUNT_MANAGEMENT: {
    key: "BANK_ACCOUNT_MANAGEMENT",
    name: "Banka Hesapları",
    description: "Banka hesaplarını yönetebilirsiniz.",
    exist: false,
  },
  BANK_ACCOUT_VIEW: {
    key: "BANK_ACCOUT_VIEW",
    name: "Banka Hesapları Görüntüleme",
    description: "Banka hesaplarını görüntüleyebilirsiniz.",
  },
  USER_MANAGEMENT: {
    key: "USER_MANAGEMENT",
    name: "Kullanıcı Yönetimi",
    description: "Kullanıcıları yönetebilirsiniz.",
  },
  USER_VIEW: {
    key: "USER_VIEW",
    name: "Kullanıcı Görüntüleme",
    description: "Kullanıcıları görüntüleyebilirsiniz.",
  },
  RECONCILIATION_VIEW: {
    key: "RECONCILIATION_VIEW",
    name: "Mutabakat Görüntüleme",
    description: "Mutabakat görüntüleyebilirsiniz.",
  },
};

const checkPermission = (user, requiredPermissionKey) => {
  let userPermissions = user.permissions;
  if (user.type === "admin" || user.type === "super_admin") return true;

  return Object(userPermissions).hasOwnProperty(requiredPermissionKey);
};

module.exports = { PERMISSIONS: permissions, checkPermission };
