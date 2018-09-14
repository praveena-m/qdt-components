import React from 'react';
import PropTypes from 'prop-types';
import Preloader from '../utilities/Preloader';

export default class QdtViz extends React.Component {
  static propTypes = {
    qAppPromise: PropTypes.object.isRequired,
    id: PropTypes.string,
    type: PropTypes.oneOf([null, 'barchart', 'boxplot', 'combochart', 'distributionplot', 'gauge', 'histogram', 'kpi', 'linechart', 'piechart', 'pivot-table', 'scatterplot', 'table', 'treemap', 'extension']),
    cols: PropTypes.array,
    options: PropTypes.object,
    noSelections: PropTypes.bool,
    width: PropTypes.string,
    height: PropTypes.string,
    minWidth: PropTypes.string,
    minHeight: PropTypes.string,
  }

  static defaultProps = {
    id: null,
    type: null,
    cols: [],
    options: {},
    noSelections: false,
    width: '100%',
    height: '100%',
    minWidth: 'auto',
    minHeight: 'auto',
  }

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      error: null,
    };
  }

  componentWillMount() {
    this.qVizPromise = this.create();
  }

  componentDidMount() {
    this.show();
  }

  componentWillReceiveProps(newProps) {
    if (JSON.stringify(newProps.options) !== JSON.stringify(this.props.options)) {
      this.setOptions(newProps.options);
    }
  }

  componentWillUnmount() {
    this.close();
  }

  async setOptions(options) {
    try {
      const qViz = await this.qVizPromise;
      qViz.setOptions(options);
    } catch (error) {
      this.setState({ error });
    }
  }

  async create() {
    try {
      const {
        qAppPromise, id, type, cols, options,
      } = this.props;
      const qApp = await qAppPromise;
      const qVizPromise = id ? qApp.visualization.get(id) : qApp.visualization.create(type, cols, options); // eslint-disable-line max-len
      return qVizPromise;
    } catch (error) {
      this.setState({ error });
      return undefined;
    }
  }

  addScrollListener(nodeToListen) {
    if (nodeToListen && nodeToListen[0] && nodeToListen[0].parentNode) {
      nodeToListen[0].addEventListener('wheel', (event) => {
        if (event.deltaY > 0) {
          event.preventDefault();
          document.documentElement.scrollTop += 100;
        }
      });
    }
  }

  async show() {
    try {
      const qViz = await this.qVizPromise;
      if (qViz) {
        await this.setState({ loading: false });
        qViz.show(this.node, { noSelections: this.props.noSelections });
        setTimeout(() => {
          this.addScrollListener(this.node.querySelectorAll("div.qv-chart-component.qv-layout-medium[tcl='combo-area']"));
          this.addScrollListener(this.node.querySelectorAll("article[tid='qv-object-waterfallchart'] div.qv-object-content.ng-isolate-scope"));
          // this.addScrollListener(this.node.querySelectorAll('div.qv-grid-object-scroll-area'));
        }, 2200, this.node, this.addScrollListener);
      } else {
        throw new Error('Please specify a qConfig global variable');
      }
    } catch (error) {
      this.setState({ error });
    }
  }

  async close() {
    try {
      const qViz = await this.qVizPromise;
      qViz.close();
    } catch (error) {
      this.setState({ error });
    }
  }

  async resize() {
    const qViz = await this.qVizPromise;
    qViz.resize();
  }

  render() {
    const {
      width, height, minWidth, minHeight,
    } = this.props;
    if (this.state.error) {
      return <div>{this.state.error.message}</div>;
    } else if (this.state.loading) {
      //   return <div>Loading...</div>;
      const paddingTop = (parseInt(height, 0)) ? (height / 2) - 10 : 0;
      return <Preloader width={width} height={height} paddingTop={paddingTop} />;
    }
    return (<div
      ref={(node) => { this.node = node; }}
      style={{
        width, height, minWidth, minHeight,
      }}
    />);
  }
}
