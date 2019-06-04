/**
 * Visualization of variants
 * @flow
 */
'use strict';
import {AllelFrequencyStrategy} from '../types';


import type {VcfDataSource} from '../sources/VcfDataSource';
import type {DataCanvasRenderingContext2D} from 'data-canvas';
import type {VizProps} from '../VisualizationWrapper';
import type {Scale} from './d3utils';
import type {State} from '../types';
import {React, ReactDOM} from '../ShimDependencies';

import d3utils from './d3utils';
import shallowEquals from 'shallow-equals';
import ContigInterval from '../ContigInterval';
import canvasUtils from './canvas-utils';
import dataCanvas from 'data-canvas';
import style from '../style';

class VariantTrack extends React.Component<VizProps<VcfDataSource>, State> {
  props: VizProps<VcfDataSource>;

  state: State;

  constructor(props: VizProps<VcfDataSource>) {
    super(props);
  }

  render(): any {
    return <canvas onClick={this.handleClick.bind(this)} />;
  }

  componentDidMount() {
    this.updateVisualization();

    this.props.source.on('newdata', () => {
      this.updateVisualization();
    });
  }

  getScale(): Scale {
    return d3utils.getTrackScale(this.props.range, this.props.width);
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (!shallowEquals(prevProps, this.props) ||
        !shallowEquals(prevState, this.state)) {
      this.updateVisualization();
    }
  }

  updateVisualization() {
    var canvas = ReactDOM.findDOMNode(this),
        {width, height} = this.props;

    // Hold off until height & width are known.
    if (width === 0) return;
    
    if (canvas && canvas instanceof Element) { // check for getContext
      if (canvas instanceof HTMLCanvasElement) { // check for sizeCanvas
        d3utils.sizeCanvas(canvas, width, height);
      }
      var ctx = canvasUtils.getContext(canvas);
      var dtx = dataCanvas.getDataContext(ctx);
      this.renderScene(dtx);
    } else {
      throw new TypeError("canvas is not an Element");
    }
  }

  renderScene(ctx: DataCanvasRenderingContext2D) {
    var range = this.props.range,
        interval = new ContigInterval(range.contig, range.start, range.stop),
        variants = this.props.source.getVariantsInRange(interval),
        scale = this.getScale(),
        height = this.props.height,
        y = height - style.VARIANT_HEIGHT - 1;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.reset();
    ctx.save();

    ctx.fillStyle = style.VARIANT_FILL;
    ctx.strokeStyle = style.VARIANT_STROKE;
    variants.forEach(variant => {
      var variantHeightRatio = 1.0;
      if (this.props.options.variantHeightByFrequency) {
        var frequency = null;
        if (this.props.options.allelFrequencyStrategy === undefined) { //default startegy
          frequency = variant.majorFrequency;
        } else if (this.props.options.allelFrequencyStrategy === AllelFrequencyStrategy.Major) {
          frequency = variant.majorFrequency;
        } else if (this.props.options.allelFrequencyStrategy === AllelFrequencyStrategy.Minor) {
          frequency = variant.minorFrequency;
        } else {
          console.log("Unknown AllelFrequencyStrategy: ",this.props.options.allelFrequencyStrategy);
        }
        if (frequency !== null && frequency !== undefined) {
          variantHeightRatio = frequency;
        }
      }
      var height = style.VARIANT_HEIGHT*variantHeightRatio;
      var variantY = y - 0.5 + style.VARIANT_HEIGHT - height;
      var variantX = Math.round(scale(variant.position)) - 0.5;
      var width = Math.max(1, Math.round(scale(variant.position + 1) - scale(variant.position)));
      ctx.pushObject(variant);

      ctx.fillRect(variantX, variantY, width, height);
      ctx.strokeRect(variantX, variantY, width, height);
      ctx.popObject();
    });

    ctx.restore();
  }

  handleClick(reactEvent: any) {
    var ev = reactEvent.nativeEvent,
        x = ev.offsetX,
        y = ev.offsetY,
        canvas: (null | Element | Text) = ReactDOM.findDOMNode(this);

    if (canvas == null ) return;

    if (canvas && canvas instanceof Element) {
      var ctx = canvasUtils.getContext(canvas),
          trackingCtx = new dataCanvas.ClickTrackingContext(ctx, x, y);
      this.renderScene(trackingCtx);

      var variants = trackingCtx.hit;
      if (variants && variants.length>0) {
        var data = [];
        for (var i=0;i<variants.length;i++) {
          data.push({
            id:       variants[i].id,
            vcfLine:  variants[i].vcfLine,
            ref:      variants[i].ref,
            alt:      variants[i].alt});
        }
        //user provided function for displaying popup
        if (typeof this.props.options.onVariantClicked  === "function") {
          this.props.options.onVariantClicked(data);
        } else {
          console.log("Variants clicked: ", data);
        }
      }
    } else {
      throw new TypeError("canvas is not an Element");
    }
  }
}

VariantTrack.displayName = 'variants';

module.exports = VariantTrack;
