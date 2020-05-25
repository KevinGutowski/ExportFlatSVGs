import sketch from 'sketch'
import dialog from '@skpm/dialog'
// documentation: https://developer.sketchapp.com/reference/api/
let exportOptions = {
  formats: "svg",
  output: "~/Downloads",
  overwriting: true,
  compact: true,
  scales: "1"
}


export default function() {
  let doc = sketch.getSelectedDocument()
  let layers = []

  exportOptions.output = dialog.showOpenDialogSync(
    doc, {
      title: "Export Location",
      defaultPath: "~/Downloads",
      buttonLabel: "Save",
      properties: [
        'openDirectory',
        'createDirectory'
      ]
    }
  )[0]

  console.log(exportOptions.output);

  if (layers.length == 0) {
    let nativeLayers = doc.sketchObject.allExportableLayers()

    for (let i = 0; i < nativeLayers.count(); i++) {
      layers.push(sketch.fromNative(nativeLayers[i]))
    }

    layers.filter(hasSVGForExport)

    let duplicatedLayers = []
    layers.forEach(layer => {
      let dup = layer.duplicate()
      let textLayers = sketch.find('Text', dup)
      textLayers.forEach(textLayer => {
        textLayer.sketchObject.layersByConvertingToOutlines()
      })
      duplicatedLayers.push(dup)
    })

    duplicatedLayers.forEach(layer => {
      layer.exportFormats.forEach(exportFormat => {
        layer.name = exportFormat.prefix + layer.name
        sketch.export(layer, exportOptions)
      })
      layer.parent = null
    })
    sketch.UI.message(`Exported ${duplicatedLayers.length} Flattened SVGs`)

  } else {
    layers = doc.selectedLayers.layers
    let duplicatedLayers = []
    layers.forEach(layer => {
      let dup = layer.duplicate()
      let textLayers = sketch.find('Text', dup)
      textLayers.forEach(textLayer => {
        textLayer.sketchObject.layersByConvertingToOutlines()
      })
      duplicatedLayers.push(dup)
    })
    sketch.export(duplicatedLayers, exportOptions)
    duplicatedLayers.forEach(layer => layer.parent = nil)
    sketch.UI.message(`Exported ${duplicatedLayers.length} Flattened SVGs`)
  }
}

function hasSVGForExport(layer) {
  let exportFormats = layer.exportFormats
  if (exportFormats.find(exportFormat => exportFormat.fileFormat == 'svg')) {
    return true
  } else {
    return false
  }
}
