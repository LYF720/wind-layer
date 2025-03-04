import { CanvasLayer, renderer, Coordinate, Point } from 'maptalks';

import { WindCore, Field, isArray, formatData, assign, defaultOptions } from 'wind-core';
import type { IField, IOptions } from 'wind-core';

import { containsCoordinate, Extent, transformExtent } from './utils';

export interface IWindOptions extends IOptions {
  windOptions: Partial<IOptions>;
  [key: string]: any;
}

const _options = {
  renderer: 'canvas',
  doubleBuffer: false,
  animation: false,
  windOptions: {},
};

export type IWindLayerRenderer = any;

export class WindLayerRenderer extends renderer.CanvasLayerRenderer implements IWindLayerRenderer {
  private _drawContext: CanvasRenderingContext2D;
  public canvas: HTMLCanvasElement | undefined;
  public layer: any;
  public context: CanvasRenderingContext2D;
  private wind: WindCore;
  checkResources() {
    return [];
  }

  getDrawParams() {
    return [];
  }

  hitDetect() {
    return false;
  }

  draw() {
    this.prepareCanvas();
    this.prepareDrawContext();
    this.drawWind();
  }

  _redraw() {
    this.prepareRender();
    this.draw();
  }

  drawWind() {
    const map = this.getMap();
    if (this.context) {
      const layer = this.layer;
      const opt = layer.getWindOptions();
      if (!this.wind && map) {
        const data = layer.getData();

        this.wind = new WindCore(this.context, opt, data);

        this.wind.project = this.project.bind(this);
        this.wind.unproject = this.unproject.bind(this);
        this.wind.intersectsCoordinate = this.intersectsCoordinate.bind(this);
        this.wind.postrender = () => {
          // @ts-ignore
          this.setCanvasUpdated();
        };

        this.wind.prerender();
      }

      if (this.wind) {
        this.wind.prerender();

        this.wind.render();
      }
    }
    this.completeRender();
  }

  project(coordinate: [number, number]): [number, number] {
    const map = this.getMap();
    const pixel = map.coordinateToContainerPoint(new Coordinate(coordinate[0], coordinate[1]));
    return [pixel.x, pixel.y];
  }

  unproject(pixel: [number, number]): [number, number] {
    const map = this.getMap();
    const coordinates = map.containerPointToCoordinate(new Point(pixel[0], pixel[1]));
    return coordinates.toArray();
  }

  intersectsCoordinate(coordinate: [number, number]): boolean {
    // FIXME: 临时处理
    if (!this.layer) return false;
    const proj = this.layer?.getProjection();
    if (proj && proj.code !== 'EPSG:3857') {
      return true;
    }
    const map = this.getMap();
    const projExtent = map.getProjExtent();
    const extent = [projExtent.xmin, projExtent.ymin, projExtent.xmax, projExtent.ymax] as Extent;
    const mapExtent = transformExtent(extent, 0) as Extent;
    return containsCoordinate(mapExtent, [coordinate[0], coordinate[1]]) as boolean;
    // return true;
  }

  drawOnInteracting() {
    // this.draw();
  }

  onZoomStart(...args: any[]) {
    if (this.wind) {
      this.wind.stop();
    }
    super.onZoomStart.apply(this, args);
  }

  onZoomEnd(...args: any[]) {
    if (this.wind) {
      this.wind.start();
    }
    super.onZoomEnd.apply(this, args);
  }

  onDragRotateStart(...args: any[]) {
    if (this.wind) {
      this.wind.stop();
    }
    super.onDragRotateStart.apply(this, args);
  }

  onDragRotateEnd(...args: any[]) {
    if (this.wind) {
      this.wind.start();
    }
    super.onDragRotateEnd.apply(this, args);
  }

  onMoveStart(...args: any[]) {
    if (this.wind) {
      this.wind.stop();
    }
    super.onMoveStart.apply(this, args);
  }

  onMoveEnd(...args: any[]) {
    if (this.wind) {
      this.wind.start();
    }
    super.onMoveEnd.apply(this, args);
  }

  // onResize() {}

  remove() {
    if (this.wind) {
      this.wind.stop();
    }
    // @ts-ignore
    delete this._drawContext;
    super.remove();
  }

  public getMap() {
    return super.getMap();
  }

  private prepareCanvas() {
    return super.prepareCanvas();
  }

  private prepareDrawContext() {
    super.prepareDrawContext();
  }

  private prepareRender() {
    return super.prepareRender();
  }

  public completeRender() {
    return super.completeRender();
  }
}

class MaptalksWind extends CanvasLayer {
  private field: Field | undefined;
  // @ts-ignore
  private _map: any;
  private options: IWindOptions;

  constructor(id: string | number, data: any, options: any = {}) {
    super(id, assign({}, _options, options));
    this._map = null;

    this.pickWindOptions();

    if (data) {
      this.setData(data, options.fieldOptions);
    }
  }

  // onAdd() {}

  // onRemove() {}

  private pickWindOptions() {
    Object.keys(defaultOptions).forEach((key: string) => {
      if (this.options && key in this.options) {
        if (this.options.windOptions === undefined) {
          this.options.windOptions = {};
        }
        // @ts-ignore
        this.options.windOptions[key] = this.options[key];
      }
    });
  }

  /**
   * get wind layer data
   */
  public getData() {
    return this.field;
  }

  /**
   * set layer data
   * @param data
   * @param options
   * @returns {WindLayer}
   */
  public setData(data: any, options: Partial<IField> = {}) {
    if (data && data.checkFields && data.checkFields()) {
      this.field = data;
    } else if (isArray(data)) {
      this.field = formatData(data, options);
    } else {
      console.error('Illegal data');
    }

    const r = this._getRenderer();
    if (r && r.wind && this.field) {
      r.wind.updateData(this.field);
    }

    return this;
  }

  public setWindOptions(options: Partial<IOptions>) {
    const beforeOptions = this.options.windOptions || {};
    this.options = assign(this.options, {
      windOptions: assign(beforeOptions, options || {}),
    });

    const r = this._getRenderer();
    if (r && r.wind) {
      const windOptions = this.options.windOptions;
      r.wind.setOptions(windOptions);
    }
  }

  public getWindOptions() {
    return this.options.windOptions || {};
  }

  public draw() {
    if (this._getRenderer()) {
      this._getRenderer()._redraw();
    }
    return this;
  }

  public prepareToDraw() {
    return [];
  }

  public drawOnInteracting() {
    this.draw();
  }

  private _getRenderer() {
    return super._getRenderer();
  }
}

// @ts-ignore
MaptalksWind.registerRenderer('canvas', WindLayerRenderer);

const WindLayer = MaptalksWind;

export { Field, WindCore, WindLayer, formatData };

export default MaptalksWind;
