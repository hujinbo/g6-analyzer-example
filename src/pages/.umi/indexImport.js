
    
        import { Spin } from 'antd';
        import ReactDOM from 'react-dom';
        
    export default () => {
      const beforePromises = [
      ].filter(m => {
        return typeof m === 'function';
      }).map( m => m()).filter( m => m.then );
      
          if (beforePromises.length) {
            ReactDOM.render(
              <div style={{
                textAlign: 'center',
                marginTop: 140,
              }}>
                <Spin />
              </div>,
              document.getElementById('root')
            );
          }
          
      return Promise.all(beforePromises).then((res) => {
        // 这里不适用 g_plugins 暴露的方式是只支持 index.js 里面的 default
        // 不支持 app.js 的 default，未来推动用户使用 app.js 中的 render 替代
        const indexModule = null;
        if (indexModule && typeof indexModule === 'function') {
          return indexModule(window.g_app);
        } else {
          return res;
        }
      }).then(res => {
        
        return res;
      });
    };
    