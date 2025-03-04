<template>
  <div class="demo-content">
    <div class="demo-content-datgui" ref="gui"></div>
    <div class="map-warp" ref="map"></div>
  </div>
</template>
<script setup>
import {ref, onMounted} from 'vue';
import 'maptalks/dist/maptalks.css';
import {
  Map,
  TileLayer,
} from 'maptalks';

import { WindLayer, ScalarLayer } from '@sakitam-gis/maptalks-wind';

const map = ref(null)
const gui = ref(null)

const initMap = async (dom, gui) => {
  const map = new Map(dom, {
    center: [113.53450137499999, 34.44104525],
    zoom: 3,
    baseLayer: new TileLayer('base', {
      urlTemplate: '//{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      // urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c', 'd'],
    })
  });

  fetch('https://sakitam.oss-cn-beijing.aliyuncs.com/codepen/wind-layer/json/wind.json')
      .then(res => res.json())
      .then(res => {
        const velocityScales = {
          0: 1 / 20,
          1: 1 / 20,
          2: 1 / 20,
          3: 1 / 30,
          4: 1 / 40,
          5: 1 / 50,
          6: 1 / 60,
          7: 0.003,
          8: 0.002,
          9: 0.001,
          10: 0.0005,
          11: 0.0003,
          12: 0.00015,
          13: 0.0001,
          14: 0.00005,
          15: 0.000025,
          16: 0.00001,
          17: 0.000005,
          18: 0.000002,
          19: 0.000001,
          20: 0.0000005,
          21: 0.0000002,
          22: 0.0000001,
        };

        // res = res.map((item, idx) => {
        //   item.header = Object.assign(item.header, {
        //     parameterCategory: 1,
        //     parameterNumber: idx === 0 ? 2 : 3,
        //   });
        //   return item;
        // });

        const windLayer = new WindLayer('wind', res, {
          windOptions: {
            // colorScale: (m) => {
            //   // console.log(m);
            //   return '#fff';
            // },
            // colorScale: [
            //   "rgb(36,104, 180)",
            //   "rgb(60,157, 194)",
            //   "rgb(128,205,193 )",
            //   "rgb(151,218,168 )",
            //   "rgb(198,231,181)",
            //   "rgb(238,247,217)",
            //   "rgb(255,238,159)",
            //   "rgb(252,217,125)",
            //   "rgb(255,182,100)",
            //   "rgb(252,150,75)",
            //   "rgb(250,112,52)",
            //   "rgb(245,64,32)",
            //   "rgb(237,45,28)",
            //   "rgb(220,24,32)",
            //   "rgb(180,0,35)"
            // ],
            colorScale: '#fff',
            velocityScale: () => {
              const zoom = map.getZoom();
              return velocityScales[zoom] || 1 / 40;
            },
            // paths: 5000,
            frameRate: 16,
            maxAge: 60,
            globalAlpha: 0.9,
            // velocityScale: 0.5,
            // paths: 10000,
            paths: 3782,
          },
        });

        const color = {
          temp: [[203,[115,70,105,255]],
            [218,[202,172,195,255]],
            [233,[162,70,145,255]],
            [248,[143,89,169,255]],
            [258,[157,219,217,255]],
            [265,[106,191,181,255]],
            [269,[100,166,189,255]],
            [273.15,[93,133,198,255]],
            [274,[68,125,99,255]],
            [283,[128,147,24,255]],
            [294,[243,183,4,255]],
            [303,[232,83,25,255]],
            [320,[71,14,0,255]]],
          wind: [
            [0,[98,113,183,255]],
            [1,[57,97,159,255]],
            [3,[74,148,169,255]],
            [5,[77,141,123,255]],
            [7,[83,165,83,255]],
            [9,[53,159,53,255]],
            [11,[167,157,81,255]],
            [13,[159,127,58,255]],
            [15,[161,108,92,255]],
            [17,[129,58,78,255]],
            [19,[175,80,136,255]],
            [21,[117,74,147,255]],
            [24,[109,97,163,255]],
            [27,[68,105,141,255]],
            [29,[92,144,152,255]],
            [36,[125,68,165,255]],
            [46,[231,215,215,255]],
            [51,[219,212,135,255]],
            [77,[205,202,112,255]],
            [104,[128,128,128,255]]
          ],
        };

        const windInterpolateColor = color.wind.reduce((result, item, key) => result.concat(item[0], 'rgba(' + item[1].join(',') + ')'), []);
        const tempInterpolateColor = color.temp.reduce((result, item, key) => result.concat(item[0] - 273.15, 'rgba(' + item[1].join(',') + ')'), []);

        const scalarLayer = new ScalarLayer('scalar', {
          // "type": "jsonArray",
          // "data": res,
          "type": "image",
          "url": 'https://sakitam.oss-cn-beijing.aliyuncs.com/codepen/wind-layer/image/var_ugrd-var_vgrd.png',
          "extent": [
            [-180, 85.051129],
            [-180, -85.051129],
            [180, 85.051129],
            [180, -85.051129],
          ],
          // "width": res[0]['header']['nx'],
          // "height": res[0]['header']['ny'] - 1,
          // max: 42.25002441406252,
          // min: -50.84996643066404,
          // "uMin": res[0]['header']['min'],
          // "uMax": res[0]['header']['max'],
          // "vMin": res[1]['header']['min'],
          // "vMax": res[1]['header']['max'],
          "width": 1440,
          "height": 720,
          "uMin": -21.34380340576172,
          "uMax": 30.7261962890625,
          "vMin": -23.916271209716797,
          "vMax": 24.693727493286133,
        }, {
          styleSpec: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'value'],
              ...windInterpolateColor
            ],
            'opacity': [
              'interpolate',
              ['exponential', 0.5],
              ['zoom'],
              5,
              0.5,
              8,
              1
            ],
          },
          renderForm: 'rg',
          // colorScale: [
          //   'rgba(36, 104, 180, 0.5)',
          //   'rgba(60, 157, 194, 0.5)',
          //   'rgba(128, 205, 193, 0.5)',
          //   'rgba(151, 218, 168, 0.5)',
          //   'rgba(198, 231, 181, 0.5)',
          //   'rgba(238, 247, 217, 0.5)',
          //   'rgba(255, 238, 159, 0.5)',
          //   'rgba(252, 217, 125, 0.5)',
          //   'rgba(255, 182, 100, 0.5)',
          //   'rgba(252, 150, 75, 0.5)',
          //   'rgba(250, 112, 52, 0.5)',
          //   'rgba(245, 64, 32, 0.5)',
          //   'rgba(237, 45, 28, 0.5)',
          //   'rgba(220, 24, 32, 0.5)',
          //   'rgba(180, 0, 35, 0.5)',
          // ],
        });

        const tempLayer = new ScalarLayer('temp', {
          // "type": "jsonArray",
          // "data": res,
          "type": "image",
          "url": 'https://sakitam.oss-cn-beijing.aliyuncs.com/codepen/wind-layer/image/var_tmp.png',
          "extent": [
            [-180, 85.051129],
            [-180, -85.051129],
            [180, 85.051129],
            [180, -85.051129],
          ],
          "width": 1440,
          "height": 720,
          "min": -50.84996643066404,
          "max": 42.25002441406252,
        }, {
          styleSpec: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'value'],
              ...tempInterpolateColor
            ],
            'opacity': [
              'interpolate',
              ['exponential', 0.5],
              ['zoom'],
              5,
              0.5,
              8,
              1
            ],
          },
          wrapX: true,
          renderForm: 'r',
          widthSegments: 720,
          heightSegments: 360,
          // widthSegments: 1,
          // heightSegments: 1,
          // displayRange: [0, 80],
          mappingRange: [0, 20000],
        });

        console.log(map, windLayer);

        function initGui(windLayer) {
          const config = {
            addLayer: true,
            scalarLayer: false,
            tempLayer: true,
            paths: 1000,
            lineWidth: 3,
            velocityScale: 0.005,
            globalAlpha: 0.8,
            maxAge: 90,
          };

          const gui = new dat.GUI({
            autoPlace: false,
          });
          gui.appendChild(gui.domElement);

          const folder1 = gui.addFolder('粒子图层');
          folder1.add(config, 'addLayer').onChange(function () {
            if (config.addLayer) {
              window.map.addLayer(windLayer);
            } else {
              window.map.removeLayer(windLayer);
            }
          });
          folder1.add(config, 'globalAlpha', 0.01, 1).onChange(function () {
            windLayer.setWindOptions({
              globalAlpha: config.globalAlpha,
            });
          });
          folder1.add(config, 'maxAge', 1, 200).onChange(function () {
            windLayer.setWindOptions({
              maxAge: config.maxAge,
            });
          });

          folder1.add(config, 'paths', 500, 8000).onChange(function () {
            windLayer.setWindOptions({
              paths: config.paths,
            });
          });

          folder1.add(config, 'lineWidth', 1, 10).onChange(function () {
            windLayer.setWindOptions({
              lineWidth: config.lineWidth,
            });
          });

          folder1.add(config, 'velocityScale', 0, 0.1).onChange(function () {
            windLayer.setWindOptions({
              velocityScale: config.velocityScale,
            });
          });

          window.folder1 = folder1;

          const folder2 = gui.addFolder('风色斑图');

          folder2.add(config, 'scalarLayer').onChange(function () {
            if (config.scalarLayer) {
              window.map.addLayer(scalarLayer);
            } else {
              window.map.removeLayer(scalarLayer);
            }
          });

          const folder3 = gui.addFolder('温度色斑图');

          folder3.add(config, 'tempLayer').onChange(function () {
            if (config.tempLayer) {
              window.map.addLayer(tempLayer);
            } else {
              window.map.removeLayer(tempLayer);
            }
          });

          window.gui = gui;
        }

        map.addLayer(tempLayer);
        // map.addLayer(scalarLayer);
        map.addLayer(windLayer);

        initGui(windLayer);
      });
}

onMounted(() => {
  initMap(map.value, gui.value);
});
</script>

<style lang="less">
.demo-content {
  width: 100%;
  height: 100vh;
  position: relative;
  background-color: #cbe0ff;

  &-datgui {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1;
    pointer-events: auto;
  }

  .map-warp {
    width: 100%;
    height: 100%;
  }
}
</style>
