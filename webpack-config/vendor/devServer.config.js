module.exports = {
  contentBase: './dist/',
  host: '192.168.103.22',
  port: 8083, // 默认8080 
  inline: true, // 可以监控js变化
  hot: true, // 热启动
  compress: true,
  watchContentBase: false,  
};
