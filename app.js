const puppeteer = require("puppeteer");
const path = require("path");

var express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());

const port = 3005;

app.post("/smartstore/login", async (req, res) => {
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: false,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1280, // 페이지 너비
      height: 720, // 페이지 높이
    });
    await page.goto(
      "https://nid.naver.com/nidlogin.login?mode=form&url=https%3A%2F%2Fwww.naver.com"
    );
    await page.waitForTimeout(20000);

    // cookie.cookie = cookies;
    // await this.naverRepo.saveCookie(cookie);

    await page.goto("https://sell.smartstore.naver.com/", {
      waitUntil: "networkidle2",
    });
    await page.click(
      "body > ui-view.wrap > div.seller-about-wrap.pc > div.section.service-intro > div > div.info-area > div.btn-area > button.btn.btn-login"
    );
    await page.waitForTimeout(5000);
    await page.click(
      "#root > div > div.Layout_wrap__3uDBh > div > div > div.Login_simple_box__2bfAS > button"
    );
    await page.waitForTimeout(2000);
    const ssCookie = await page.cookies();

    // res.setHeader(
    //   "Set-Cookie",
    //   `${ssCookie[0]["name"]}=${ssCookie[0]["value"]}`
    // );

    let cookie = "";
    for (const k of ssCookie) {
      k.name = "NSI";
      cookie = k;
    }
    browser.close();
    return res.json(cookie);
  } catch (e) {
    browser.close();
    console.error(e.message);

    return res.send("false");
  }
});

app.post("/smartstore/edit", async (req, res) => {
  const { products_no } = req.body;
  const chromiumPath = puppeteer.executablePath();
  console.log(chromiumPath, "여기");
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: false,
    args: ["--window-size=1600,1080"],
    executablePath: chromiumPath,
  });
  let pages = await browser.newPage();
  await pages.setViewport({
    width: 1600, // 페이지 너비
    height: 1080, // 페이지 높이
  });
  pages.on("dialog", async (dialog) => {
    //console.log(dialog.type(), dialog.message());
    await dialog.accept();
  });
  let login = 0;

  for await (const prod of products_no) {
    try {
      pages = await browser.pages();

      if (login === 0) {
        await pages[1].goto(
          "https://nid.naver.com/nidlogin.login?mode=form&url=https%3A%2F%2Fwww.naver.com"
        );
        await pages[1].waitForNavigation(
          "#account > div.MyView-module__my_menu___eF24q > div > div > ul > li:nth-child(1)"
        );

        // cookie.cookie = cookies;
        // await this.naverRepo.saveCookie(cookie);

        await pages[1].goto("https://sell.smartstore.naver.com/", {
          waitUntil: "networkidle2",
        });
        await pages[1].click(
          "body > ui-view.wrap > div.seller-about-wrap.pc > div.section.service-intro > div > div.info-area > div.btn-area > button.btn.btn-login"
        );
        await pages[1].waitForTimeout(5000);
        await pages[1].click(
          "#root > div > div.Layout_wrap__3uDBh > div > div > div.Login_simple_box__2bfAS > button"
        );
        await pages[1].waitForTimeout(5000);
        login++;
      }

      const bodyModal = await pages[1].$(
        "body > div.modal.fade.seller-layer-modal.modal-no-space.modal-transparent.in > div > div"
      );
      if (bodyModal != null) {
        await pages[1].click(
          "body > div.modal.fade.seller-layer-modal.modal-no-space.modal-transparent.in > div > div > div.modal-body > div.modal-footer > div > div > label"
        );
      }

      await pages[1].goto(
        `https://sell.smartstore.naver.com/#/products/origin-list`,
        {
          waitUntil: "networkidle2",
        }
      );
      await pages[1].waitForTimeout(3000);

      // await pages[1].$eval(
      //   "#seller-content > div.seller-notice.seller-layer-modal.has-close-check-box > div",
      //   (el) => el.remove()
      // );
      await pages[1].evaluate(() => {
        const elementToRemove = document.querySelector("div.modal-dialog");
        //document.querySelector("div.modal-dialog").style.display = "none";
        //elementToRemove.sty.
        if (elementToRemove) {
          elementToRemove.parentElement.removeChild(elementToRemove);
        }
      });

      await pages[1].waitForTimeout(5000);
      await pages[1].click(
        "#seller-content > ui-view > div > ui-view:nth-child(1) > div.panel.panel-seller > form > div.panel-body > div > ul > li:nth-child(1) > div > div > div:nth-child(2) > textarea"
      );
      await pages[1].keyboard.type(prod);
      await pages[1].click(
        "#seller-content > ui-view > div > ui-view:nth-child(1) > div.panel.panel-seller > form > div.panel-footer > div > button.btn.btn-primary"
      );
      //      throw new Error("error");
      await pages[1].waitForTimeout(3000);
      await pages[1].click(
        "#seller-content > ui-view > div > ui-view:nth-child(2) > div.panel.panel-seller > div.panel-body > div.seller-grid-area > div > div > div > div > div.ag-body-viewport.ag-layout-normal.ag-row-no-animation > div.ag-pinned-left-cols-container > div > div:nth-child(2) > span > button"
      );
      //여기 직전까지 상품상세로 들어가는 작업
      await pages[1].waitForTimeout(3000);
      //* 상품상세 진입
      const elementExists1 = await pages[1].$(
        "body > div:nth-child(1) > div > div > div.modal-footer > div > button"
      );

      if (elementExists1 !== null) {
        await pages[1].click(
          "body > div:nth-child(1) > div > div > div.modal-footer > div > button"
        );
        const elementExists2 = await pages[1].$(
          "body > div:nth-child(1) > div > div > div.modal-footer > div > button"
        );
        if (elementExists2 !== null) {
          await pages[1].click(
            "body > div:nth-child(1) > div > div > div.modal-footer > div > button"
          );
        }
      }
      const smartEditorChangeProduct = await pages[1].$(
        "#anchor-detail-content > div > div.input-content.inner-content > div > div > ncp-editor-form > div.seller-product-detail.seller-tap-wrapper > div > p.btn-area > button"
      );
      if (smartEditorChangeProduct != null) {
        console.log(
          `상품번호 : ${prod}는 이미 스마트에디터로 전환이 되어있습니다.`
        );
        continue;
      }
      await pages[1].waitForTimeout(3000);
      await pages[1].click(
        "#anchor-detail-content > div > div.input-content.inner-content > div > div > ncp-editor-form > div.detail-content.btn-group-lg > div > a"
      );
      await pages[1].waitForTimeout(5000);
      pages = await browser.pages();

      // await pages[1].waitForTimeout(5000);
      //? 스마트에디터 전환 START
      const buttonElementExists = await pages[2].$(
        "body > ui-view.wrap > ncp-editor-launcher > div.header-editor"
      );
      await pages[2].waitForTimeout(5000);
      await pages[2].waitForSelector(
        "body > ui-view.wrap > ncp-editor-launcher > div.header-editor > div > button"
      );
      await pages[2].click(
        "body > ui-view.wrap > ncp-editor-launcher > div.header-editor > div > button"
      );
      await pages[1].waitForTimeout(3000);
      //? 스마트에디터 전환 끝

      //? 속성 정보 클릭 및 정보넣기 시작
      await pages[1].click("#_prod-attr-section > div.title-line");
      await pages[1].waitForSelector(
        "#_prod-attr-section > div.inner-content.input-content > div > ncp-naver-shopping-search-info > div:nth-child(2) > div > div:nth-child(1) > div > ncp-brand-manufacturer-input > div > div > div > div > div"
      );
      await pages[1].click(
        "#_prod-attr-section > div.inner-content.input-content > div > ncp-naver-shopping-search-info > div:nth-child(2) > div > div:nth-child(1) > div > ncp-brand-manufacturer-input > div > div > div > div > div"
      );
      const brand = await pages[1].$(
        "#_prod-attr-section > div.inner-content.input-content > div > ncp-naver-shopping-search-info > div:nth-child(2) > div > div:nth-child(1) > div > ncp-brand-manufacturer-input > p > strong"
      );
      let value = await pages[1].evaluate((el) => el.textContent, brand);
      await pages[1].keyboard.type(value);
      await pages[1].keyboard.press("Enter");
      await pages[1].waitForTimeout(3000);
      await pages[1].keyboard.press("Enter");
      await pages[1].click(
        "#_prod-attr-section > div.inner-content.input-content > div > ncp-naver-shopping-search-info > div:nth-child(2) > div > div:nth-child(1)"
      );
      await pages[1].waitForTimeout(6000);
      //? 속성 정보 클릭 및 정보넣기 END

      await pages[1].click(
        "#seller-content > ui-view > div.seller-sub-content > div.seller-btn-area.btn-group-xlg.hidden-xs > button.btn.btn-primary.progress-button.progress-button-dir-horizontal.progress-button-style-top-line"
      );
      await pages[1].waitForTimeout(3000);

      const check = pages[1].$(
        "body > div.modal.fade.seller-layer-modal.in > div > div > div.modal-footer > div > button.btn.btn-default"
      );
      if (check) {
        await pages[1].click(
          "body > div.modal.fade.seller-layer-modal.in > div > div > div.modal-footer > div > button.btn.btn-default"
        );
      }

      // await pages[1].waitForTimeout(3000);
      // await pages[1].click(
      //   "body > div.modal.fade.seller-layer-modal.in > div > div > div.modal-footer > div > button.btn.btn-default"
      // );
      console.log(`상품번호 : ${prod} success`);
      await pages[1].waitForTimeout(10000);
    } catch (e) {
      console.log(`상품번호 : ${prod} fail reason : ${e}`);
    }
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
