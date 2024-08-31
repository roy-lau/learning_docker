-- https://github.com/openresty/lua-cjson/
local json = require("cjson")

-- 设置响应头
ngx.header.content_type = 'application/json; charset=utf-8'


local table = {
  name='roylau',
  type_G=type(_G),
  time=ngx.time(),
  isDebug=ngx.config.debug
}

ngx.print(json.encode(table))