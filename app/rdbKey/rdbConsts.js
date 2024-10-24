const redis_main_const = {
  REDIS_MAGIC_VERSION: 5,
  REDIS_VERSION: 4,
};
const OPCODES = {
  EOF: 0xff,
  SELECTDB: 0xfe,
  EXPIRETIME: 0xfd,
  EXPIRETIMEMS: 0xfc,
  RESIZEDB: 0xfb,
  AUX: 0xfa,
};

export default { redis_main_const, OPCODES };
