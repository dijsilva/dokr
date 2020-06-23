const { Menu, Tray } = require('electron')
const path = require('path')
var Docker = require('dockerode')
var docker = new Docker({socketPath: '/var/run/docker.sock'});

const assetDir = path.join(__dirname, '..', 'assets');

class DockerTray {

    constructor(){
        this.dockertray = new Tray(path.join(assetDir, 'tray.png'))
        this.render()
    }

    async render() {
        const menu = Menu.buildFromTemplate([
          {type: 'normal', label: 'Docker Tray'},
          { type: 'separator' },
          ...await this.renderCont(),
          { type: 'separator' },
          this.buttonRefresh(),
          this.buttonQuit()
        ]);        
        this.dockertray.setContextMenu(menu);
    }

    getContainers(){
      return new Promise((resolve, reject)=>{
        docker.listContainers({all: true}, function(err, containers) {
          if(err) {
            reject(err)
          } else{
            resolve(containers)
          }
        });
      })
    }

    async renderCont(){
      const containers = await this.getContainers()
      const self = this;
      const containersList = containers.map(cont => {
          return {
            'name': cont.Names[0].slice(1,),
            'state': cont.State,
            'id': cont.Id
          }
        })
      return containersList.map(container => {
        return { 
          type: 'normal',
          label: ` ${container.name}`,
          icon: path.resolve(__dirname, '..', 'assets', `${container.state === 'running' ? 'online' : 'offline'}.png`),
          async click() {
            container.state === 'running' ? await docker.getContainer(container.id).stop() : await docker.getContainer(container.id).start()
            self.render();
          },
        };
      })
    }

    buttonQuit(){
      return {
        role: 'quit',
        label: ' Quit',
        // icon: path.resolve(__dirname, '..', 'assets', 'tray.png'),
        };
    }

    buttonRefresh(){
      return {
        click: this.render.bind(this),
        label: 'Refresh',
        // icon: path.resolve(__dirname, '..', 'assets', 'tray.png'),
      }
    }
}

module.exports = DockerTray
