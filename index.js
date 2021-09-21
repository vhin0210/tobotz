function Tobotz(options) {
  const tobotz = {};
  const axios = require('axios');

  const host = 'https://api.tobotz.vhinandrich.com/';

  tobotz.options = options;
  tobotz.connection = {
    sessionId: Math.random().toString(36).substr(2, 9)
  };

  const getBot = async function() {
    return await axios({
      url: host + '/graphql',
      method: 'post',
      data: {
        query: `
          query GetApplication($clientId: String!) {
            application(clientId: $clientId) {
              id
              name
              applicationDetail {
                name
              }
            }
          }
        `,
        variables: {
          clientId: options?.clientId
        }
      },
      headers: {
        'Authorization': `Bearer ${options?.token}`
      }
    }).then(function(request) {
      return request?.data?.data;
    });
  }

  const sendMessage = async function(message) {
    return await axios({
      url: host + '/graphql',
      method: 'post',
      data: {
        query: `
          mutation SendMessage($applicationId: String!, $message: String!, $senderId: String!) {
            message(applicationId: $applicationId, message: $message, senderId: $senderId) {
              reply {
                id
                message
                created
                bot
              }
            }
          }
        `,
        variables: {
          applicationId: tobotz.connection.application.id,
          message: message,
          senderId: (options?.userId && options?.userId.length > 0) ? options.userId : tobotz.connection.sessionId,
        }
      },
      headers: {
        'Authorization': `Bearer ${options?.token}`
      }
    }).then(function(request) {
      if (request?.data.errors !== undefined) {
        throw request.data.errors;
      }
      return request?.data?.data;
    });
  }

  tobotz.connect = async function() {
    const data = await getBot();
    this.connection = Object.assign(this.connection, data);
    return {
      name: data.application.applicationDetail[0].name,
      message: `Hi! I'm ${data.application.applicationDetail[0].name}. How may I help you?`,
      object: data,
    }
  }

  tobotz.ping = async function() {
    const data = await getBot();
    return {
      name: data.application.applicationDetail[0].name,
      message: 'Pong',
      object: data,
    }
  };

  tobotz.send = async function(message) {
    const data = await sendMessage(message).catch(function(error) {
      return {
        errors: error
      }
    });

    let dataMessage = '';
    if (data.message === undefined || data.message === null) {
      if (data.errors !== undefined) {
        console.error("Tobotz::send - response error", data);
        dataMessage = {
          isError: true,
          message: 'Unexpected error occured.',
        };
      }
    } else {
      dataMessage = data.message.reply;
    }

    return {
      name: this.connection.application.applicationDetail[0].name,
      message: dataMessage,
      object: data,
    };
  };

  return tobotz;
}
module.exports = Tobotz;
