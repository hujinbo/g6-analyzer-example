import path from 'path';
import ExtraWatchWebpackPlugin from 'extra-watch-webpack-plugin';

export default config => {


  const iconsReg = /(.*?)icons\/svg\/(.*?)\.svg(\?v=\d+\.\d+\.\d+)?$/i;
  const iconSvgReg = /\.icon\.svg(\?v=\d+\.\d+\.\d+)?$/; // 以icon方式引入一般svg文件, 使用.icon.svg，适用于antd-icon component属性
  const imgSvgReg = /\.img\.svg(\?v=\d+\.\d+\.\d+)?$/; // 以图片方式引入一般svg文件，使用.img.svg, 接受width和height

  config.module
    .rule('icon-svg')
    .test(iconSvgReg)
    .use('svgr')
    .loader('@svgr/webpack')
    .options({
      icon: true,
    })

  config.module
    .rule('exclude')
    .merge({
      exclude: [iconsReg, iconSvgReg, imgSvgReg]
    });



  config.module
    .rule('img-svg')
    .test(imgSvgReg)
    .use('svgr')
    .loader('@svgr/webpack')

  config.plugin('extra-watch').use(ExtraWatchWebpackPlugin, [{
    files: [
      path.resolve(__dirname, '../src/router.js'),
      path.resolve(__dirname, '../src/style/variables.less'),
      path.resolve(__dirname, '../src/style/antd/12px.less'),
      path.resolve(__dirname, '../src/style/antd/theme.less'),
    ]
  }]);

};
