# Samba print head simulator

This web based application can simulate Fujifilm Dimatix Samba G3L printheads, with angle and stitch adjustment functions, as well as print capabilities to simulate the result of the mechanical adjustment.

## Usage
Demo is available here: [https://fulbert.github.io/nozzle-playgound/](https://fulbert.github.io/nozzle-playgound/).  

- Use 🖱️ wheel to zoom in, and  to pan the view.  
- Use <kbd>ALT</kbd> + 🖱️ wheel to adjust head angle.  
- Use <kbd>SHIFT</kbd> + 🖱️ to wheel adjust head stitch. 
- Drop a tiff file to print it

## Contribute
1. Install a development environment with `git`, `node` and `yarn`
1. Clone the project:
`git clone https://github.com/Fulbert/nozzle-playgound.git`
1. Open created folder:
`cd nozzle-playground`
1. Install dependencies:
`yarn`
1. Run development environment:
`yarn dev`
1. Build
`yarn build`

### Development guidelines
- Project is based on Vue 3 and use composables
- Project is fully written in typescript
- Code lint is checked in development environment when file are saved
- Composables architectures:
  - `useCanvas()` is used to hook a printer to an HTML Canvas element
  It provides watchers for canvas event (UI) and drawing functions using the printer property.
  The canvas drawing is triggered when printer's reactive properties are changed.
    - `usePrinter()` is a description of printer basic printer with:
      - `usePrintbar()[]` a printbar is a row of aligned printheads
        - `useHead()[]` a printhead is a representation of the nozzle plates
          - `nozzle[]` is the deeper type in the printer description
      - `drops` is a array of drop description, based on a bitmap tiff.