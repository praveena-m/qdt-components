let qlik;
let capabilityApisPromise;

const loadCapabilityApis = async (config) => {
  try {
    if (capabilityApisPromise) {
      await capabilityApisPromise;
      return;
    }
    const capabilityApisJS = document.createElement('script');
    const prefix = (config.prefix !== '') ? `/${config.prefix}` : '';
    capabilityApisJS.src = `${(config.secure ? 'https://' : 'http://') + config.host + (config.port ? `:${config.port}` : '') + prefix}/resources/assets/external/requirejs/require.js?qlikTicket=${config.ticket}`;
    document.head.appendChild(capabilityApisJS);
    capabilityApisJS.loaded = new Promise((resolve) => {
      capabilityApisJS.onload = () => { resolve(); };
    });
    const capabilityApisCSS = document.createElement('link');
    capabilityApisCSS.href = `${(config.secure ? 'https://' : 'http://') + config.host + (config.port ? `:${config.port}` : '') + prefix}/resources/autogenerated/qlik-styles.css?qlikTicket=${config.ticket}`;
    capabilityApisCSS.type = 'text/css';
    capabilityApisCSS.rel = 'stylesheet';
    document.head.appendChild(capabilityApisCSS);
    capabilityApisCSS.loaded = new Promise((resolve) => {
      capabilityApisCSS.onload = () => { resolve(); };
    });

    capabilityApisPromise = Promise.all([capabilityApisJS.loaded, capabilityApisCSS.loaded]);

    await capabilityApisPromise;
  } catch (error) {
    throw new Error(error);
  }
};

const qApp = async (config) => {
  try {
    await loadCapabilityApis(config);
    const prefix = (config.prefix !== '') ? `/${config.prefix}/` : '/';
    window.require.config({
      baseUrl: `${(config.secure ? 'https://' : 'http://') + config.host + (config.port ? `:${config.port}` : '') + prefix}resources`,
      paths: {
        qlik: `${(config.secure ? 'https://' : 'http://') + config.host + (config.port ? `:${config.port}` : '') + prefix}resources/js/qlik`,
      },
      config: {
        text: {
          useXhr() {
            return true;
          },
        },
      },
    });
    return new Promise((resolve) => {
      if (qlik) {
        const app = qlik.openApp(config.appId, { ...config, isSecure: config.secure, prefix });
        resolve(app);
      } else {
        window.require(['js/qlik'], (q) => {
          qlik = q;
          const app = qlik.openApp(config.appId, { ...config, isSecure: config.secure, prefix });
          resolve(app);
        });
      }
    });
  } catch (error) {
    throw new Error(error);
  }
};

export default qApp;
