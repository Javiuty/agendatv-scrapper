import puppeteer from 'puppeteer'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

const pathToData = path.join(__dirname, 'agenda.json')

const saveAgendaData = async () => {
  const browser = await puppeteer.launch({ dumpio: true })
  const page = await browser.newPage()

  const ua =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'

  await page.setUserAgent(ua)

  await page.goto('https://www.marca.com/programacion-tv.html')

  await page.waitForSelector('#didomi-notice-agree-button')

  await page.click('#didomi-notice-agree-button')

  const scrappeData = await page.evaluate(() => {
    return [...document.querySelectorAll('.auto-items .content-item')].map((context) => {

      const date = context.querySelector('.title-section-widget').textContent

      const infoEvent = [...context.querySelectorAll('.dailyevent')].map(evt => {
        const discipline = evt.querySelector('.dailyday').textContent
        const hour = evt.querySelector('.dailyhour').textContent
        const competition = evt.querySelector('.dailycompetition').textContent
        const teams = evt.querySelector('.dailyteams').textContent.replaceAll('\n', '')
        const channel = evt.querySelector('.dailychannel').textContent

        return { discipline, hour, competition, teams, channel }
      })

        return { date, events: infoEvent } 
    }) 
  })

  await browser.close()
  
   const json = {
    data: scrappeData,
    timestamp: Date.now()
  }
  return json
}

// execute and persist data
saveAgendaData().then((data) => {
  // persist data
  fs.writeFileSync(path.resolve(pathToData), JSON.stringify(data, null, 2))
})
