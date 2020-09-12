var Generator = require('yeoman-generator');
var SequelizeAuto = require('sequelize-auto');

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
        this.option('babel');
    }

    async prompting() {
        this.answers = await this.prompt([
            {type: "input", name: "name", message: "Project name", default: this.appname},
            {type: "input", name: "dbhost", message: "Database host", default: "127.0.0.1", store: true},
            {type: "input", name: "dbport", message: "Database port", default: 3306, store: true},
            {type: "input", name: "dbuser", message: "Database user", default: "root", store: true},
            {type: "input", name: "dbpassword", message: "Database password", store:true}, //TODO: no almacenar
            {type: "input", name: "dbname", message: "Database name", default: this.appname, store: true},
            {type: "confirm", name: "confirm", message: "Are you sure?"}
        ])
    }

    initProject() {
        const pkgJson = {
            "name": this.answers.name,
            "version": "0.0.0",
            "private": true,
            "scripts": {
              "start": "node ./bin/www"
            },            
            "dependencies": {
                "cookie-parser": "~1.4.4",
                "debug": "~2.6.9",
                "dotenv": "^8.2.0",
                "express": "~4.16.1",
                "hbs": "~4.0.4",
                "http-errors": "~1.6.3",
                "moment": "^2.27.0",
                "morgan": "~1.9.1",
                "mysql2": "^2.1.0",
                "node-sass-middleware": "0.11.0",
                "nunjucks": "^3.2.2",
                "sequelize": "^6.3.5"
              }
          };
      
        // Extend or create package.json file in destination path
        this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);        
    }

    writing() {
    }


    //TODO: activar
    _install() {
        this.npmInstall();
    }


    async generatingModels() {
        var auto = new SequelizeAuto(this.answers.dbname, this.answers.dbuser, this.answers.dbpassword, {
            host: this.answers.dbhost,
            dialect: 'mysql',
            //directory: false, // prevents the program from writing to disk
            port: this.answers.dbport,
            caseModel: 'c', // convert snake_case column names to camelCase field names: user_id -> userId
            // caseFile: 'c', // file names created for each model use camelCase.js not snake_case.js
            additional: {
                //timestamps: false

                //...
            },
            // tables: ['table1', 'table2', 'myschema.table3'] // use all tables if omitted
            //...
        });

        await new Promise((resolve, reject) => auto.run((err) => err? reject(err) : resolve()));

        for (const t in auto.tables) {
            if (auto.tables.hasOwnProperty(t)) {
                const model = auto.tables[t];
                this.log("Generating routes for " + t);
                this.log(model);

                this.fs.copyTpl(this.templatePath('controller.js'), this.destinationPath('routes/'+t+'.js'), {modelName:t, model})
                this.fs.copyTpl(this.templatePath('list.html'), this.destinationPath('views/'+t+'_list.html'), {modelName:t, model})
                this.fs.copyTpl(this.templatePath('detail.html'), this.destinationPath('views/'+t+'_detail.html'), {modelName:t, model})
            }
        }

        this.fs.copyTpl(this.templatePath('app.js'), this.destinationPath('app.js'),{models: auto.tables})
        this.fs.copyTpl(this.templatePath('_db.js'), this.destinationPath('models/_db.js'),{})
        this.fs.copyTpl(this.templatePath('_base.html'), this.destinationPath('views/_base.html'),{})
        this.fs.copyTpl(this.templatePath('_menu.html'), this.destinationPath('views/_menu.html'),{})

        this.fs.copyTpl(this.templatePath('.env.example'), this.destinationPath('.env.example'), {...Object.assign({...this.answers}, {dbpassword:'xxx'})})
        this.fs.copyTpl(this.templatePath('.env.example'), this.destinationPath('.env'), {...this.answers})
    }



    finish() {
        this.log("All done!");
        this.config.save();
    }
};
