// @ts-ignore
import PERMISSIONS from "../consts/ViewPermissions.json";
export default function renderForPermission(type, permissionKey) {
  try {
    const permissions = permissionKey.split(".");
    const page = permissions[0];
    const permissionName = permissions[1];
    return PERMISSIONS[page][permissionName][type];
  } catch (e) {
    return false;
  }
}

