const getters = {
  token: state => state.user.token,
  username: state => state.user.username,
  roles: state => state.user.roles,
  menus: state => state.user.menus,
  addRouters: state => state.permission.addRouters,
  multiTab: state => state.app.multiTab
}
export default getters