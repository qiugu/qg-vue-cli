const download = require("download-git-repo")
const inquirer = require("inquirer")
//  模板语言扩展
const handlebars = require("handlebars")
const fs = require("fs")
//  加载动画
const chalk = require("chalk")
const symbols = require("log-symbols")
//  下载的模块的value
const moduleFiles = ['json', 'views/user', 'tests']
const { deleteFiles } = require('./util/util.js')
const { createSpinner } = require('./util/spinner.js')

const callback = async (...args) => {
  if (fs.existsSync(args[0])) {
    // 错误提示项目已存在，避免覆盖原有项目
    console.log(symbols.error, chalk.red("Error 项目已存在"));
    return;
  }
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "description",
      message: chalk.bold.yellow('请输入项目描述')
    },
    {
      type: "input",
      name: "version",
      message: chalk.bold.yellow('请输入项目版本号')
    },
    {
      type: "input",
      name: "author",
      message: chalk.bold.yellow('请输入作者名称')
    },
    {
      type: 'list',
      name: 'ui',
      message: chalk.bold.yellow('请选择使用的ui框架'),
      choices: [
        { name: 'Element', value: 'element-ui' },
        { name: 'Ant Design Vue', value: 'ant-design-vue' }
      ]
    },
    {
      type: 'checkbox',
      name: 'structure',
      message: chalk.bold.yellow('请选择要使用的模块'),
      choices: [
        { name: '角色权限json文件', value: 'json' },
        { name: '管理系统登录注册组件', value: 'views/user' },
        { name: '单元测试', value: 'tests' }
      ]
    }
  ])

  if (!answers) {
    return
  }
  const spinner = createSpinner('正在下载模板...')
  spinner.start()

  // 回答交互之后的回调方法
  download(
    "direct:https://gitee.com/qiuguPro/ant-qiugu-template.git",
    args[0],
    { clone: true },
    err => {
      if (!err) {
        const meta = {
          name: args[0],
          description: answers.description,
          author: answers.author,
          version: answers.version
        };
        const filePackage = `${args[0]}/package.json`
        if (fs.existsSync(filePackage)) {
          const content = fs.readFileSync(filePackage).toString()
          const result = handlebars.compile(content)(meta)
          fs.writeFileSync(filePackage, result)
        }
        // 根据所选的项，删除未选的模块
        moduleFiles.forEach(item => {
          if (answers.structure.indexOf(item) === -1) {
            if (item === 'tests') {
              deleteFiles(`${args[0]}/${item}`)
            } else {
              deleteFiles(`${args[0]}/src/${item}`)
            }
          }
        })
        console.log()
        spinner.succeed(chalk.blue.italic.bold(`Successfully ${chalk.cyan.bold(args[0])} 下载成功`));
      } else {
        spinner.fail();
        console.log(symbols.error, chalk.red(`Error: 拉取远程仓库失败${err}`))
      }
    }
  )
}

module.exports = callback