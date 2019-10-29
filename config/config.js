import alias from './alias.config';
import theme from './theme.config';
import routes from './routes.config';
import chainWebpack from './plugin.config'

// ref: https://umijs.org/config/
export default {
  // 接口代理配置
  proxy: {
    dev: {
      'developer/': {
        target: 'http://11.166.116.240:8080',
      },
      'admin/': {
        target: 'http://antgraphconsole-antgraph44-1.STABLE.alipay.net'
      },
      'sendBucSSOToken.htm': {
        target: 'http://antgraphconsole-antgraph44-1.STABLE.alipay.net',
      }
    },
    test: {
      'developer/': {
        target: 'http://antgraphconsole-antgraph44-1.STABLE.alipay.net',
      },
      'sendBucSSOToken.htm': {
        target: 'http://antgraphconsole-antgraph44-1.STABLE.alipay.net',
      }
    },
    pre: {
      // 线上环境
      'developer/': {
        target: 'antgraphconsole',
      },
      'admin/': {
        target: 'antgraphconsole',
      },
      'sendBucSSOToken.do': {
        target: 'antgraphconsole',
      }
    },
  },
  //   npm_package._moduleAliases || {},
  theme,
  routes,
  chainWebpack,
  targets: {
    // 屏蔽浏览器原生的 Class 定义，使用转换后的 Class，
    // 否则 Class 中的 Generator 方法将转换异常，导致不能使用。
    // 影响：构建结果稍微变大(1.74M => 1.75M)
    // 后续：@云谦 看看怎么解更加优雅
    // chrome: 46,
  },
  plugins: [],
  dva: false,
  extraBabelPlugins: [],
  lessLoaderOptions: {
    test: /\.less$/,
    use: [
      {
        loader: "style-loader"
      },
      {
        loader: "typings-for-css-modules-loader?module&less"
      },
      {
        loader: "less-loader",
        options: {
          javascriptEnabled: true
        }
      }
    ]
  },
  alias: alias,
}

