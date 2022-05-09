const TG = require('node-telegram-bot-api')
const DB = require('./db')
require('dotenv').config()

const bot = new TG(process.env.token, { polling: true });
const db = new DB(process.env.database_path);

bot.setMyCommands([
  {
    command: 'send',
    description: 'Отправить реквест',
  },
  {
    command: 'remark',
    description: 'Посмотреть все замечания отправленные мне или мной',
  },
  {
    command: 'fix',
    description: 'Посмотреть все исправления отправленные мне или мной',
  },
  {
    command: 'complete',
    description: 'Посмотреть все выполненные реквесты',
  },
  {
    command: 'from',
    description: 'Посмотреть все отправленные мной реквесты',
  },
  {
    command: 'to',
    description: 'Посмотреть все отправленные мне реквесты',
  }
]);

bot.onText(/\/send/, (msg) => {
  const from = msg.from.id;
  if(msg.entities[1]?.type === 'mention' || msg.entities[1]?.type === 'text_mention') {
    new Promise((resolve, reject) => {
      if(msg.entities[1]?.type !== 'mention') {
          resolve(msg.entities[1]?.user?.id)
        } else {
          db.getUserByUsername(msg.text.split(' ')[1]?.split('@')[1]).then(user => {
          resolve(Number(user.id))
        }).catch(() => bot.sendMessage(from, 'Пользователь не найден'))
      }
    }).then((to) => {
      bot.sendMessage(from, 'Введите ссылку');
      getText(from).then((url) => {
          newReq(from, to, url)
      })
    })
  } else bot.sendMessage(msg.chat.id, 'Вы не выбрали пользователя')
})

bot.onText(/\/start/, (msg) => {
  db.getUserById(msg.from.id).then((user) => {
    if(!user) {
      db.createUser(msg.from)
      .then((user) => bot.sendMessage(msg.chat.id, `Попривествуем ${user.first_name}`))
    } else {
      db.updateUser(msg.from)
      .then((user) => bot.sendMessage(msg.chat.id, `Попривествуем ${user.first_name}`))
    }
  })
})

bot.onText(/\/help/, (msg) => {
  const text = `/start для добавления пользователя в базу или обновления его данных, например username\n/send для создания реквеста\n/help для вызова списка комманд\n/from получить все отправленые мной реквесты\n/complete получить все завершёные реквесты, отправленные мной\n/to получить все реквесты назначенные мне\n/remark получить все реквесты назначенные мне или для меня со статусом замечания\n/fix получить все реквесты назначенные мне и для меня со статусом исправлено`
  bot.sendMessage(msg.chat.id, text)
})

bot.onText(/\/from/, (msg) => {
  db.getRequestsFrom(msg.from.id).then((requests) => {
    requests.forEach((req) => {
      sendRequest(msg.from.id, req)
    });
  })
})

bot.onText(/\/to/, (msg) => {
  db.getRequestsTo(msg.from.id).then((requests) => {
    requests.forEach((req) => {
      sendRequest(msg.from.id, req)
    });
  })
})

bot.onText(/\/to-remark/, (msg) => {
  db.getRequestsToAndRemark(msg.from.id).then((requests) => {
    requests.forEach((req) => {
      sendRequest(msg.from.id, req)
    });
  })
})

bot.onText(/\/complete/, (msg) => {
  db.getCompletedRequests(msg.from.id).then((requests) => {
    i = 0;
    stop = false;
    console.log(requests)
    do {
      for(let j = 0; j < i + 10; j++) {
        console.log(requests[j])
        sendRequest(msg.from.id, requests[j]);
      }
      if(requests.lenght > 10) {
        bot.sendMessage('Вывести ещё?');
        getText(msg.from).then((answer) => {
        if(answer != 'да') {
          stop = true;
        }
      })
      } 
      getText(msg.from);
    } while(!stop) {
        i += 10;
        for(let j = 0; j < i + 10; j++) {
          sendRequest(msg.from.id, requests[j]);
        }
        if(requests.lenght > 10) {
          bot.sendMessage('Вывести ещё?');
          getText(msg.from).then((answer) => {
          if(answer != 'да') {
            stop = true;
          }
        })
      }
    }
  })
})

bot.onText(/\/remark/, (msg) => {
  db.getRequestRemark(msg.from.id).then((requests) => {
    requests.forEach((req) => {
      sendRequest(msg.from.id, req)
    });
  })
})

bot.onText(/\/fix/, (msg) => {
  db.getRequestFix(msg.from.id).then((requests) => {
    requests.forEach((req) => {
      sendRequest(msg.from.id, req)
    });
  })
})

bot.on('callback_query', (query) => {
  let command = query.data.split('_')[0]
  let id = query.data.split('_')[1]

  switch(command) {
    case 'remark': {
      bot.sendMessage(query.from.id, 'Введите замечание')
      getText(query.from.id).then((remark) => {
        remarkReq(query.from.id, id, remark)
      })
      break;
    }
    case 'fix': {
      bot.sendMessage(query.from.id, 'Введите сообщение')
      getText(query.from.id).then((fix) => {
        fixReq(query.from.id, id, fix)
      })
      break;
    }
    case 'complete': {
      completeReq(query.from.id, id)
      break;
    }
  } 
})

bot.on('new_chat_members', (msg) => {
  db.createUser(msg.new_chat_members)
    .then((user) => bot.sendMessage(msg.chat.id, `Попривествуем ${user.first_name}`))
})

function newReq(from, to, url) {
  const request = {
    from: from,
    to: to,
    url: url,
    date: new Date().toString()
  }
  db.createRequest(request).then((req) => {
    sendRequest(to, req)
  }).catch(error => {

  })
}

function remarkReq(from, id, remark) {
  db.getRequestById(id).then((request) => {
    if(from != request.to) {
      bot.sendMessage(from, 'Вы не являетесь получателем данного реквеста')
    } else {
      db.remarkRequest(id, remark).then((req) => {
        sendRequest(req.from, req)
      })
    }
  })
}

function fixReq(from, id, fix) {
  db.getRequestById(id).then((request) => {
    if(from != request.from) {
      bot.sendMessage(from, 'Вы не являетесь отправителем данного реквеста')
    } else {
      db.fixRequest(id, fix).then((req) => {
        sendRequest(req.to, req)
      })
    }
  })
}

function completeReq(from, id) {
  db.getRequestById(id).then((request) => {
    if(from != request.to) {
      bot.sendMessage(from, 'Вы не являетесь получателем данного реквеста')
    } else {
      db.completeRequest(id).then((req) => {
        sendRequest(req.from, req)
      })
    }
  })
}

function getText(to) {
 return new Promise((resolve, reject) => {
   let listener = (message) => {
    if(message.from.id === to) {
      bot.removeListener('text', listener)
      resolve(message.text)
    }
   }
   bot.on('text', listener)
 })
}

function sendRequest(to, req) {
  db.getUserById(req.from).then((usrFrom) => {
    db.getUserById(req.to).then((usrTo) => {
      const _date = new Date(req.date)
      const _date_str = `${_date.toLocaleString('default', { day: "numeric" ,month: 'long', hour: "numeric", minute: "numeric" })}`
      const text =`${req.url}\nстатус: ${req.status}\nот: ${usrFrom.first_name} ${usrFrom.username}\nкому: ${usrTo.first_name} ${usrTo.username}\nвремя: ${_date_str}\nзамечания: ${req.remark}\nисправления: ${req.fix}\n`
      const options = {
        reply_markup: {
          inline_keyboard: [
            [ 
              {
                text: 'Замечания',
                callback_data: ['remark', req.id].join('_')
              },
              {
                text: 'Исправлено',
                callback_data: ['fix', req.id].join('_')
              }
            ],
            [
              {
                text: 'Завершен',
                callback_data: ['complete', req.id].join('_')
              }
            ]
          ]
        }
      }

      bot.sendMessage(to, text, options)
    })
  })
}