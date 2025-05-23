const TelegramBot = require('node-telegram-bot-api'); 

module.exports = function(app, mongoose, express, bot, authMiddleware) {
  
const TOKEN = '8055291382:AAGJYycInowWDSs9N_nxIwCLdoVd2DjCTXQ';
const OWNER_ID = '5019818643';
const ownerId  = '5019818643';
const ALLOWED_GROUP_ID = '-1001821054615';
const GroupLink = 'https://t.me/hivajoymovies';
const UpdateChannelId = '-1002598760582';
const UpdateChannelLink = 'https://t.me/Hivabyte';// Update channel
const dbChannelId = '-1002567891050';
const logChannelId = '-1002274317757';
  
  // Define file schema and model
const filesschema = new mongoose.Schema({
  name: String,
  fileId: String,
  link: String,
  uniqueId: { type: String, unique: true },
  size: Number,
  thumbId: String,
  streamLink: String,
});

const File = mongoose.model('File', filesschema);
  
    // 📁 Folder schema with compound index (name + parentId)
  const folderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    folderId: { type: String, unique: true },
    parentId: { type: String, default: null }
  });
  folderSchema.index({ name: 1, parentId: 1 }, { unique: true }); // 👈 NEW INDEX

  const fileSchema = new mongoose.Schema({
    folderId: { type: String, required: true },
    filename: String,
    fileId: String,
    uniqueId: { type: String, unique: true },
    size: Number,
    streamLink: String,
  });

  const Folder = mongoose.model('Folder', folderSchema);
  const FolderFile = mongoose.model('FolderFile', fileSchema);


  const botschema = new mongoose.Schema({
  folderId: String
});

const BOT = mongoose.model('BOT', botschema);

bot.onText(/\/addf (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const fid = match[1];

  try {
    const result = await BOT.findOneAndUpdate(
      {},                    // Match any (since only one document should exist)
      { folderId: fid },     // Update the folderId
      { upsert: true, new: true }  // Create if not exists
    );

    bot.sendMessage(chatId, `BOT folderId updated to: ${fid}`);
  } catch (err) {
    console.error('Error updating BOT folderId:', err);
    bot.sendMessage(chatId, 'Failed to update folderId.');
  }
});

  bot.onText(/\/currentfolder/, async (msg) => {
    
  const botData = await BOT.findOne();
  const fid = botData.folderId;
    const folder = await Folder.findOne({folderId: fid});
      bot.sendMessage(OWNER_ID, `Current Folder for Uploading : ${folder.name} ${fid}`);
  
  });
  
  
  // Command to show all folders
bot.onText(/\/see/, async (msg, match) => {
  const chatId = msg.chat.id;

  try {
    const folders = await Folder.find();

    if (folders.length === 0) {
      return bot.sendMessage(chatId, '📂 No folders found.');
    }

    // Format the folder data
    const formatted = folders.map(folder => 
      `🗂️ Name: *${folder.name}*\n🆔 ID: \`${folder.folderId}\`\n👤 Parent ID: \`${folder.parentId || 'null'}\``
    ).join('\n\n');

    await bot.sendMessage(chatId, `📁 *All Folders:*\n\n${formatted}`, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error retrieving folders:', error);
    await bot.sendMessage(chatId, '❌ Failed to retrieve folders.');
  }
});
  
  
  
  
  
  // Listen for messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const isOwnerMessage = msg.from.id.toString() === OWNER_ID;

  if (typeof msg.text === 'string' && msg.text.startsWith('http')) {
  return;
}


  // Check if the message is from a group (chatId < 0) or private message (chatId > 0)
  const isGroupMessage = chatId < 0;



        if (isOwnerMessage) {
          let filethumb = '';
            // Allow the owner to upload files, broadcast messages, etc.
            if (msg.document) {
                const fileSize = msg.document.file_size;
                filethumb = '';
                handleFileUpload(chatId, msg.document.file_name, msg.document.file_id, fileSize, filethumb)
            } else if (msg.video) {
                const fileSize = msg.video.file_size;
                filethumb = '' || msg.video.thumb.file_id;
                handleFileUpload(chatId, msg.video.file_name || 'video', msg.video.file_id, fileSize, filethumb);
            } else if (msg.audio) {
                const fileSize = msg.audio.file_size;
                filethumb = '';
                handleFileUpload(chatId, msg.audio.file_name || 'video', msg.audio.file_id, fileSize, filethumb);
            } else if (msg.photo) {
                const fileSize = msg.photo.file_size;
                handleFileUpload(chatId, msg.photo.file_name || 'image', msg.photo.file_id, fileSize, filethumb);
            
            } else if (msg.text && msg.text.startsWith('/start')) {
            handleStartCommand(chatId, msg.text);
        }
        } 
});
  
  
  // Listen for channel posts (messages posted in the channel)
bot.on('channel_post', async (message) => {
  const chatId = OWNER_ID;
  
  // Check if the message is from the specific channel and contains a file (photo, video, document, etc.)
  if (message.chat.id.toString() === dbChannelId && (message.document || message.photo || message.video || message.audio)) {
    
    // Check if the message contains a document
    if (message.document) {
      const fileSize = message.document.file_size;
      const filethumb = '';
      
      // Handle file upload (replace with your custom function)
      handleFileUpload(chatId, message.document.file_name, message.document.file_id, fileSize, filethumb) }
    // Check if the message contains a video
    else if (message.video) {
      const fileSize = message.video.file_size;
      const filethumb = message.video.thumb.file_id;
      
      // Handle file upload (replace with your custom function)
      handleFileUpload(chatId, message.video.file_name || 'video', message.video.file_id, fileSize, filethumb)
  } else if (message.audio) {
      const fileSize = message.audio.file_size;
      const filethumb = '';
      
      // Handle file upload (replace with your custom function)
      handleFileUpload(chatId, message.audio.file_name || 'video', message.audio.file_id, fileSize, filethumb)
  } else if (message.photo) {
      const fileSize = message.photo.file_size;
      
      // Handle file upload (replace with your custom function)
      handleFileUpload(chatId, message.photo.file_name || 'image', message.photo.file_id, fileSize)
  }
  }
});



  
// Handle file upload from the owner
async function handleFileUpload(chatId, fileName, fileId, fileSize, filethumb) {
  const sizeInBytes = fileSize || 0;
  
    // Sanitizing the file name
  const sanitizedFileName = fileName
    .replace(/[_-]+/g, ' ') // Replace underscores and periods with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .replace(/@\w+/g, '') // Remove @ followed by word (e.g., @username)
    .trim(); // Trim any extra spaces from the ends
const uniqueId = Math.random().toString(36).substr(2, 9);
  const shareableLink = `https://t.me/shivamnoxbot?start=${uniqueId}`;
const botData = await BOT.findOne();
  const fid = botData.folderId;
  const newFile = new FolderFile({
    folderId: fid,
    filename: sanitizedFileName,
    fileId,
    uniqueId,
    size: sizeInBytes,
  });
  await newFile.save();
console.log(sizeInBytes);
 
  // Send the shareable link as a reply to the file message with sanitized name
  bot.sendMessage(chatId, `Fɪʟᴇ "${fileName}"\nSᴀᴠᴇᴅ sᴜᴄᴄᴇssfᴜʟʏ.\nSʜᴀʀᴇᴀʙʟᴇ lɪɴᴋ: ${shareableLink}\n\nOʀɪɢɪɴᴀʟ nᴀᴍᴇ: "${fileName}"\n`);

  console.log(`Saved file: ${fileName} (Original), Link: ${shareableLink}`);
}

  
bot.onText(/\/delfile (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  let uniqueIds = match[1].split(',').map(id => id.trim()); // Split by commas and trim spaces

  // Check if the user is the owner
  if (chatId.toString() !== OWNER_ID) {
    return bot.sendMessage(chatId, `Yᴏᴜ ᴀʀᴇ ɴᴏᴛ ᴀᴜᴛʜᴏʀɪᴢᴇᴅ ᴛᴏ ᴜsᴇ tʜɪs cᴏᴍᴍᴀɴᴅ.`);
  }

  try {
    const deletedFiles = [];
    const notFoundFiles = [];

    for (const uniqueId of uniqueIds) {
      let id = uniqueId;

      // Check if the input is a URL, and extract the unique ID from it if it is
      const urlPattern = /https:\/\/t\.me\/(?:[a-zA-Z0-9_]+bot\?start=)(\S+)/;
      const urlMatch = id.match(urlPattern);

      if (urlMatch) {
        // If it's a URL, extract the unique ID from the URL
        id = urlMatch[1];
      }

      // Find and delete the file by uniqueId
      const file = await File.findOneAndDelete({ uniqueId: id });

      if (file) {
        deletedFiles.push(id); // Successfully deleted file
      } else {
        notFoundFiles.push(id); // File not found
      }
    }

    // Notify the user about the deleted and not found files
    let responseMessage = '';

    if (deletedFiles.length > 0) {
      responseMessage += `Fɪʟᴇs wɪᴛʜ ᴜɴɪqᴜᴇ ɪᴅs: ${deletedFiles.join(', ')} ʜᴀᴠᴇ bᴇᴇɴ dᴇʟᴇᴛᴇᴅ sᴜᴄᴄᴇssꜰᴜʟʟʏ.\n\n`;
    }

    if (notFoundFiles.length > 0) {
      responseMessage += `Nᴏ fɪʟᴇs fᴏᴜɴᴅ wɪᴛʜ ᴜɴɪqᴜᴇ ɪᴅs: ${notFoundFiles.join(', ')}.\n`;
    }

    bot.sendMessage(chatId, responseMessage || 'Nᴏ ᴛʀᴀɪʟɪɴɢ ᴍᴇssᴀɢᴇs tᴏ sᴇɴᴅ.');

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `Aɴ ᴇʀʀᴏʀ ᴏᴄᴄᴜʀʀᴇᴅ wʜɪʟᴇ tʀʏɪɴɢ tᴏ dᴇʟᴇᴛᴇ ᴛʜᴇ fɪʟᴇs.`);
  }
});
  
// Handle unique ID search when user clicks on shareable link
async function handleStartCommand(chatId, text) {
  const uniqueId = text.split(" ")[1];
 if (uniqueId) {
  // Check if the file exists with the given unique ID
  const file = await FolderFile.findOne({ uniqueId });
  const channelId = '-1002044705664';

  let filemsg = null;

  try {
        filemsg = await bot.sendDocument(chatId, file.fileId, {
          caption: `${file.filename}\n\n⚡ 𝓑𝓪𝓬𝓾𝓹 𝒞𝒽𝒶𝓃𝓃𝑒𝓁: @Hivabyte`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '👀 Wᴀᴛᴄʜ Oɴʟɪɴᴇ | Fᴀsᴛ Dᴏᴡɴʟᴏᴀᴅ ⬇️', callback_data: `generateLink:${file.uniqueId}` }]
            ]
          }
        });
      
      let isLinkGenerated = false;

      // Handle user click on 'Generate Link' button
      bot.on('callback_query', async (callbackQuery) => {
        const userId = callbackQuery.message.chat.id;
        const firstName = callbackQuery.from.first_name;
        if (isLinkGenerated) return; // Prevent multiple triggers for the same file
        const [action, fileId] = callbackQuery.data.split(':');
        const isOwnerMessage = callbackQuery.from.id.toString() === OWNER_ID;

        if (action === 'generateLink' && fileId === file.uniqueId) {
          isLinkGenerated = true; // Prevent further actions for this file

          // Step 7: Update the original file message's caption
          await bot.editMessageCaption(
            ':\n\n<blockquote><b>Gᴇɴᴇʀᴀᴛɪɴɢ Lɪɴᴋ... Pʟᴇᴀsᴇ wᴀɪᴛ.</b></blockquote>\n\n:',
            { parse_mode: 'HTML', chat_id: chatId, message_id: filemsg.message_id }
          );

          // Step 8: Send the file to the channel
          const sentMessage = await bot.sendDocument(channelId, file.fileId, {
            caption: `${file.name}\n\n⚡ 𝓑𝓪𝓬𝓾𝓹 𝒞𝒽𝒶𝓃𝓃𝑒𝓁: @Hivabyte`,
            parse_mode: 'HTML'
          });
          bot.sendMessage(channelId, `User ID: ${userId}\nUser Name: ${firstName}`);

          // Step 9: Wait for the other bot to add buttons (using setTimeout)
          setTimeout(async () => {
            try {
              // Step 10: Retrieve the message with buttons added by the other bot
              const fileWithButtonsMessage = await bot.forwardMessage(chatId, channelId, sentMessage.message_id);
              let streamLink = '';
              const keyboard = fileWithButtonsMessage?.reply_markup?.inline_keyboard;
              const btn = keyboard?.flat().find(b => /stream/i.test(b.text) && b.url);

              if (btn?.url) {
                streamLink = btn.url;
              }

              // Step 11: Save stream link if available
              if (streamLink) {
                file.streamLink = streamLink;
                await file.save();
              }

              // Step 12: Delete the original file message now that the new file is ready
              if (filemsg) {
                await bot.deleteMessage(chatId, filemsg.message_id).catch(console.error);
              }

            } catch (error) {
              console.error('Error while forwarding message with buttons:', error);
            }
          }, 3000); // Wait for the other bot to add buttons
        }
      });
    
  } catch (error) {
    console.error('Failed to send document:', error);
  }
}
 else {

await bot.sendMessage(chatId, 'Imao..', {
  parse_mode: 'HTML',
});

 }
}
  
  
  
  
  
  require('./search')(app, mongoose, File, bot, express);
  require('./cloud')(app, mongoose, File, bot, express, Folder, FolderFile, authMiddleware);
  
  
  };
