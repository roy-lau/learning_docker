print([[

                           _ooOoo_
                          o8888888o
                          88" . "88
                          (| -_- |)
                          O\  =  /O
                       ____/`---'\____
                     .'  \\|     |//  `.
                    /  \\|||  :  |||//  \
                   /  _||||| -:- |||||-  \
                   |   | \\\  -  /// |   |
                   | \_|  ''\---/''  |   |
                   \  .-\__  `-`  ___/-. /
                 ___`. .'  /--.--\  `. . __
              ."" '<  `.___\_<|>_/___.'  >'"".
             | | :  `- \`.;`\ _ /`;.`/ - ` : | |
             \  \ `-.   \_ __\ /__ _/   .-` /  /
        ======`-.____`-.___\_____/___.-`____.-'======
                           `=---='
        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                   佛祖保佑        永无BUG
          佛曰:
                 写字楼里写字间，写字间里程序员；
                 程序人员写程序，又拿程序换酒钱。
                 酒醒只在网上坐，酒醉还来网下眠；
                 酒醉酒醒日复日，网上网下年复年。
                 但愿老死电脑间，不愿鞠躬老板前；
                 奔驰宝马贵者趣，公交自行程序员。
                 别人笑我忒疯癫，我笑自己命太贱；
                 不见满街漂亮妹，哪个归得程序员？
]])

-- local str = "abcde"
-- print("case 1:", str:sub(1, 2))
-- print("case 2:", str.sub(str, 1, 2))
-- ngx.log(ngx.INFO, " string:", str)

-- ngx.STDERR     -- 标准输出
-- ngx.EMERG      -- 紧急报错
-- ngx.ALERT      -- 报警
-- ngx.CRIT       -- 严重，系统故障，触发运维告警系统
-- ngx.ERR        -- 错误，业务不可恢复性错误
-- ngx.WARN       -- 告警，业务中可忽略错误
-- ngx.NOTICE     -- 提醒，业务比较重要信息
-- ngx.INFO       -- 信息，业务琐碎日志信息，包含不同情况判断等
-- ngx.DEBUG      -- 调试

-- 设置响应头
ngx.header.content_type = 'text/html; charset=utf-8'


ngx.say("<h1> test lua script</h1>")
-- print(string.format("%s %02d/%02d/%d", "today is:", d, m, y))

ngx.say("<h2> lua 基本数据类型</h2>")

ngx.say('<li> type === ' .. type("hello world") .. '</li>')
ngx.say('<li> type === ' .. type(print) .. '</li>')
ngx.say('<li> type === ' .. type(true) .. '</li>')
ngx.say('<li> type === ' .. type(360.0) .. '</li>')
ngx.say('<li> type === ' .. type(nil) .. '</li>')



ngx.say("<h2> lua 时间 脚本</h2>")

ngx.say('<li>ngx.today() ---> ' .. ngx.today() .. '</li>')
ngx.say('<li>ngx.time() ---> ' .. ngx.time() .. '</li>')
ngx.say('<li>ngx.utctime() ---> ' .. ngx.utctime() .. '</li>')
ngx.say('<li>ngx.localtime() ---> ' .. ngx.localtime() .. '</li>')
ngx.say('<li>ngx.now() ---> ' .. ngx.now() .. '</li>')


ngx.say("<h2> lua 变量</h2>")

for i,v in pairs(_G) do
  print(string.format("[v= %s === type= %s ] ===> %s ", i, type(v), tostring(v)))
end

ngx.say('<li>ngx.var.time_iso8601 ---> ' .. ngx.var.time_iso8601 .. '</li>')
ngx.say('<li>ngx.var.remote_addr ---> ' .. ngx.var.remote_addr .. '</li>')
ngx.say('<li>ngx.var.body_bytes_sent ---> ' .. ngx.var.body_bytes_sent .. '</li>')
ngx.say('<li>ngx.var.request_time ---> ' .. ngx.var.request_time .. '</li>')
ngx.say('<li>ngx.var.status ---> ' .. ngx.var.status .. '</li>')
ngx.say('<li>ngx.var.request ---> ' .. ngx.var.request .. '</li>')
ngx.say('<li>ngx.var.request_method ---> ' .. ngx.var.request_method .. '</li>')
ngx.say('<li>ngx.var.request_method ---> ' .. ngx.var.request_method .. '</li>')
ngx.say('<li>ngx.var.request_uri ---> ' .. ngx.var.request_uri .. '</li>')
ngx.say('<li>ngx.var.uri ---> ' .. ngx.var.uri .. '</li>')
ngx.say('<li>ngx.var.host ---> ' .. ngx.var.host .. '</li>')
ngx.say('<li>ngx.var.scheme ---> ' .. ngx.var.scheme .. '</li>')
ngx.say('<li>ngx.var.nginx_version ---> ' .. ngx.var.nginx_version .. '</li>')

-- ngx.say('<li>ngx.var.upstream_addr ---> ' .. ngx.var.upstream_addr .. '</li>')
-- ngx.say('<li>ngx.var.http_x_forwarded_for ---> ' .. ngx.var.http_x_forwarded_for .. '</li>')
-- ngx.say('<li>ngx.var.http_referer ---> ' .. ngx.var.http_referer .. '</li>')
-- ngx.say('<li>ngx.var.http_user_agent ---> ' .. ngx.var.http_user_agent .. '</li>')
-- ngx.say('<li>ngx.var.server_protocol ---> ' .. ngx.var.server_protocol .. '</li>')

ngx.say("<h2> lua config </h2>")

ngx.say('<li>ngx.config.nginx_version ---> ' .. ngx.config.nginx_version .. '</li>')
ngx.say('<li>ngx.config.ngx_lua_version ---> ' .. ngx.config.ngx_lua_version .. '</li>')
ngx.say('<li>ngx.config.subsystem ---> ' .. ngx.config.subsystem .. '</li>')
ngx.say('<li>ngx.config.prefix() ---> ' .. ngx.config.prefix() .. '</li>')
ngx.say('<li>ngx.config.nginx_configure() ---> ' .. ngx.config.nginx_configure() .. '</li>')

ngx.say("<h2> lua req 脚本</h2>")
ngx.say('<li>ngx.req.get_method() ---> ' .. ngx.req.get_method() .. '</li>')
-- ngx.say('<li>ngx.req.get_uri_args() ---> ' .. ngx.req.get_uri_args() .. '</li>')

local function showReq()
  local arg = ngx.req.get_uri_args()
  for k,v in pairs(arg) do
      ngx.say("[GET ] key:", k, " v:", v)
  end

  ngx.req.read_body() -- 解析 body 参数之前一定要先读取 body
  local arg = ngx.req.get_post_args()
  for k,v in pairs(arg) do
      ngx.say("[POST] key:", k, " v:", v)
  end

end

showReq()