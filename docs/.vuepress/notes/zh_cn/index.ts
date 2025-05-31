import { collapse } from 'artalk/i18n/ja'
import { defineNoteConfig } from 'vuepress-theme-plume'


export default defineNoteConfig({
  dir: 'docs',
  link: '/docs/',
  sidebar: [
    {
      text: '个人主页',
      prefix: '01个人主页',
      items: [
        '爱玩游戏的尘甲'
      ]
    },
    // {
    //   text: '封禁列表',
    //   collapsed: false,
    //   prefix: 'ban',
    //   items: [
    //     'banlist'
    //   ]
    // },
    {
      text: '索引',
      items: [
        '00索引'
      ]
    },
    {
      text: '资源分享',
      collapsed: false,
      prefix: '02资源分享',
      items: [
        '整合包',
        '其他资源'
      ]
    },
    {
      text: '公益服务器',
      collapsed: false,
      prefix: '03公益服务器',
      items: [
        '尘甲-服务器0基础入坑指南',
        {
          text: '联合服-开放中',
          collapsed: false,
          prefix: '联合服',
          items: [
            '00联合服简介',
          ]
        },
        {
          text: '四周目-无限世界-开放中',
          collapsed: false,
          prefix: '四周目',
          items: [
            '欢迎手册：萌新入服指南',
            '00四周目简介',
            '01四周目新手指南',
            '02服务器生存公约',
            '03装备最优附魔表',
            '04机器命令指南',
            '05已完成的建筑',
            '06计划未来建筑',
          ]
        }  
      ]
    },
    {
      text: '关于',
      items: [
        '04关于'
      ]
    }
  ]

})
