function map(x, in_min, in_max, out_min, out_max) {
    return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  }
  
class Graph {
    constructor(data) {
      this.data = data;
      this.queryID = null;
    }
  
    updateSingle(value, index) {
      this.data[index].value = value;
    }
  
    updateArray(array) {
      for (let i = 0; i < array.length; i++) {
        this.data[i].value = array[i];
      }
    }
  
    updateAll(json) {
      this.data = json;
    }
  
    log() {
      console.log(this.data);
    }
  
    initGraph(queryID) {
      const style = document.createElement("style");
      style.textContent = `
        .graph-bar-container {
          display: flex;
          width: 450px;
          height: 50px;
        }
        .graph-bar-name {
          width: 50px;
          background-color: yellow;
        }
        .graph-bar {
          background-color: red;
          width: 400px;
        }
      `;
      document.head.appendChild(style);
      this.queryID = queryID;
      const query = document.getElementById(queryID);
      let htmlString = "";
      query.style.display = "flex";
      query.style.flexDirection = "column";
      for (let i = 0; i < this.data.length; i++) {
        htmlString += `
          <div class="graph-bar-container">
            <div class="graph-bar-name">${this.data[i].name}:</div>
            <div class="graph-bar" id="${this.data[i].name}"></div>
          </div>
        `;
      }
      query.innerHTML = htmlString;
      let iQuery = null;
      for (let i = 0; i < this.data.length; i++) {
        iQuery = document.getElementById(this.data[i].name);
        iQuery.style.width = `${
          400 * map(this.data[i].value, this.data[i].min, this.data[i].max, 0, 1)
        }px`;
      }
    }
  
    updateGraph() {
      const query = document.getElementById(this.queryID);
      let htmlString = "";
      query.style.display = "flex";
      query.style.flexDirection = "column";
      for (let i = 0; i < this.data.length; i++) {
        htmlString += `
          <div class="graph-bar-container">
            <div class="graph-bar-name">${this.data[i].name}:</div>
            <div class="graph-bar" id="${this.data[i].name}"></div>
          </div>
        `;
      }
      query.innerHTML = htmlString;
      let iQuery = null;
      for (let i = 0; i < this.data.length; i++) {
        iQuery = document.getElementById(this.data[i].name);
        iQuery.style.width = `${
          400 * map(this.data[i].value, this.data[i].min, this.data[i].max, 0, 1)
        }px`;
      }
    }
  }
  