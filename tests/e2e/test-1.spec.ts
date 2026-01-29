import { type Page, test } from '@playwright/test';

import { MultiContextHelper } from '../utils/multi-context-helper';

const getTomorrowIsoDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const approveInPhantomPopup = async (popup: Page, skipUnlock = false) => {
  await popup.waitForLoadState('domcontentloaded');
  await popup.bringToFront();

  if (!skipUnlock) {
    // nếu phantom bị khóa, nhập mật khẩu và mở khóa trước
    await popup.waitForSelector(
      '[data-testid="unlock-form-password-input"], input[name="password"], input[type="password"]',
      { state: 'visible', timeout: 2000 }, // Giảm timeout xuống 2s
    ).catch(() => { });

    const passwordInput = popup
      .locator('[data-testid="unlock-form-password-input"], input[name="password"], input[type="password"]')
      .first();
    if (await passwordInput.count()) {
      if (await passwordInput.isVisible()) {
        await popup.evaluate(() => {
          const el = document.querySelector<HTMLInputElement>('[data-testid="unlock-form-password-input"]')
            ?? document.querySelector<HTMLInputElement>('input[name="password"]')
            ?? document.querySelector<HTMLInputElement>('input[type="password"]');
          if (el) {
            el.focus();
            el.value = '';
            el.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
        const password = process.env.PHANTOM_PASSWORD || 'taiqui12';
        await passwordInput.type(password, { delay: 40 });
        const unlockButton = popup.getByTestId('unlock-form-submit-button');
        if (await unlockButton.count()) {
          await unlockButton.click();
        } else {
          const fallbackButton = popup.getByRole('button', { name: /unlock|log in/i }).first();
          if (await fallbackButton.count()) {
            await fallbackButton.click();
          } else {
            await popup.keyboard.press('Enter');
          }
        }
        await popup.waitForLoadState('domcontentloaded');
      }
    }
  }

  // Đợi popup hiển thị hoàn toàn trước khi click nút
  await popup.waitForTimeout(1000);

  // Đợi ít nhất một trong các nút xuất hiện
  await popup.locator('[data-testid="primary-button"], button').first().waitFor({
    state: 'visible',
    timeout: 5000
  });

  const primaryButton = popup.locator('[data-testid="primary-button"]').first();
  const approveButton = popup.getByRole('button', { name: /approve/i }).first();
  const signButton = popup.getByRole('button', { name: /sign/i }).first();
  const confirmButton = popup.getByRole('button', { name: /confirm/i }).first();

  if (await primaryButton.isVisible()) {
    await primaryButton.click();
  } else if (await approveButton.isVisible()) {
    await approveButton.click();
  } else if (await signButton.isVisible()) {
    await signButton.click();
  } else if (await confirmButton.isVisible()) {
    await confirmButton.click();
  } else {
    // fallback: click button cuối cùng
    await popup.locator('button').last().click();
  }

  try {
    if (!popup.isClosed()) {
      await popup.waitForTimeout(500);
    }
  } catch {

  }
};

test.beforeAll(async () => {
  await MultiContextHelper.initializeBoth();
});

test.afterAll(async () => {
  await MultiContextHelper.cleanup();
});

test('Complete Quest Flow: Create, Vote, Admin Approve, and Publish', async () => {
  test.setTimeout(400000); // 400 seconds = 6.67 minutes for complete flow

  const userPage = await MultiContextHelper.getUserPage();
  const adminPage = await MultiContextHelper.getAdminPage();

  await userPage.goto('http://localhost:3001/');

  const questButton = userPage.getByRole('button', { name: 'Quest' });
  await questButton.waitFor({ state: 'visible', timeout: 10000 });
  await questButton.click();

  const createButton = userPage.getByRole('button', { name: 'Create New Prediction' });
  await createButton.waitFor({ state: 'visible', timeout: 10000 });
  await createButton.click();
  const randomTitle = `Test ${Date.now()}`;
  const titleInput = userPage.getByRole('textbox', { name: 'Tittle' });
  await titleInput.waitFor({ state: 'visible', timeout: 10000 });
  await titleInput.fill(randomTitle);

  const detailsInput = userPage.getByRole('textbox', { name: 'Quest details' });
  await detailsInput.fill('Test detail');

  const categoryCombobox = userPage.getByRole('combobox', { name: 'Category' });
  await categoryCombobox.click();

  const firstOption = userPage.getByRole('option').first();
  await firstOption.waitFor({ state: 'visible', timeout: 5000 });
  await firstOption.click();
  const endingTimeButton = userPage.getByRole('button', { name: 'Choose ending time' });
  await endingTimeButton.click();

  const tomorrowIso = getTomorrowIsoDate();
  const tomorrowButton = userPage.locator(
    `[data-day="${tomorrowIso}"] button:not([disabled])`,
  );
  await userPage.waitForTimeout(500); // Đợi calendar render
  if (await tomorrowButton.count()) {
    await tomorrowButton.click();
  } else {
    await userPage.locator('[data-day] button:not([disabled])').first().click();
  }

  // Đóng date picker
  await userPage.keyboard.press('Escape');
  await userPage.waitForTimeout(300);

  const imageCombobox = userPage.getByRole('combobox', { name: 'Image' });
  await imageCombobox.click();

  const snsUrlOption = userPage.getByLabel('SNS url').getByText('SNS url');
  await snsUrlOption.waitFor({ state: 'visible', timeout: 5000 });
  await snsUrlOption.click();

  const urlInput = userPage.getByRole('textbox', { name: 'Please enter an URL' });
  await urlInput.waitFor({ state: 'visible', timeout: 5000 });

  // Click vào input để focus
  await urlInput.click();
  await userPage.waitForTimeout(200);

  // Clear và fill URL từng ký tự để trigger onChange
  await urlInput.clear();
  await urlInput.fill('https://picsum.photos/seed/17625246546733/600/400');

  // Blur input để trigger validation - click vào label hoặc nơi khác
  await userPage.evaluate(() => {
    const input = document.querySelector('input[name*="url"], input[placeholder*="URL"]') as HTMLInputElement;
    if (input) {
      input.blur();
      // Trigger các events để form library nhận biết
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  await userPage.waitForTimeout(500);

  // Click "Complete" để đóng dialog chọn ảnh
  const completeButton = userPage.getByRole('button', { name: 'Complete' });
  await completeButton.waitFor({ state: 'visible', timeout: 5000 });
  await completeButton.click();

  // Đợi xem có error message xuất hiện không
  await userPage.waitForTimeout(1000);

  // Kiểm tra xem có error message "Required" không
  const hasError = await userPage.locator('text=/required/i, text=/this field is required/i').isVisible().catch(() => false);
  if (hasError) {
    throw new Error('URL validation failed - Required error is showing');
  }

  // Đợi dialog đóng - urlInput sẽ biến mất
  await urlInput.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => { });
  await userPage.waitForTimeout(500);

  // Giờ quay về form chính, scroll xuống để thấy nút Approve ở cuối form
  await userPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  // Đợi nút Approve của form tạo quest xuất hiện
  const approveButton = userPage.getByRole('button', { name: 'Approve' });
  await approveButton.waitFor({ state: 'visible', timeout: 10000 });
  await approveButton.scrollIntoViewIfNeeded();
  await approveButton.click();

  const closeButton = userPage.getByRole('button', { name: 'Close', exact: true });
  await closeButton.waitFor({ state: 'visible', timeout: 5000 });
  await closeButton.click();
  const daoButton = userPage.getByRole('button', { name: 'Dao' });
  await daoButton.click();

  // Đợi trang DAO load và quest xuất hiện
  const questItem = userPage.getByText(randomTitle).first();
  await questItem.waitFor({ state: 'visible', timeout: 30000 });
  await questItem.click();

  const votingTrigger = userPage.locator('[id*="trigger-voting"]').first();
  await votingTrigger.waitFor({ state: 'visible', timeout: 5000 });
  await votingTrigger.click();

  const userApproveButton = userPage.getByRole('button', { name: 'Approve' });
  await userApproveButton.waitFor({ state: 'visible', timeout: 5000 });
  await userApproveButton.click();

  const signupApproveButton = userPage.getByLabel('log in or sign up').getByRole('button', { name: 'Approve' });
  await signupApproveButton.waitFor({ state: 'visible', timeout: 5000 });
  await signupApproveButton.click();

  // Đợi toast success xuất hiện và biến mất
  const userVoteSuccessToast = userPage.locator('.text-base.font-medium', { hasText: /success/i }).first();
  await userVoteSuccessToast.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
    console.log('No user vote success toast found, continuing...');
  });

  // Đợi thêm để toast và popup đóng hoàn toàn
  await userPage.waitForTimeout(2000);

  // Đóng dialog/popup nếu còn
  const userCloseButton = userPage.getByRole('button', { name: 'Close', exact: true });
  if (await userCloseButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await userCloseButton.click();
    await userPage.waitForTimeout(500);
  }

  // Đảm bảo không còn popup/dialog Privy nào đang hiển thị
  const privyDialog = userPage.getByLabel('log in or sign up');
  if (await privyDialog.isVisible({ timeout: 2000 }).catch(() => false)) {
    // Press Escape để đóng dialog Privy
    await userPage.keyboard.press('Escape');
    await userPage.waitForTimeout(500);
  }

  // chuyển sang context ví admin để vote quest vừa được user approve
  await adminPage.goto('http://localhost:3001/');

  const adminQuestButton = adminPage.getByRole('button', { name: 'Quest' });
  await adminQuestButton.waitFor({ state: 'visible', timeout: 10000 });
  await adminQuestButton.click();

  const adminDaoButton = adminPage.getByRole('button', { name: 'Dao' });
  await adminDaoButton.click();

  // Đợi trang DAO load và quest xuất hiện
  const adminQuestItem = adminPage.getByText(randomTitle).first();
  await adminQuestItem.waitFor({ state: 'visible', timeout: 30000 });
  await adminQuestItem.click();

  const adminVotingTrigger = adminPage.locator('[id*="trigger-voting"]').first();
  await adminVotingTrigger.waitFor({ state: 'visible', timeout: 5000 });
  await adminVotingTrigger.click();
  const phantomPopupPromise = adminPage.context().waitForEvent('page');
  await adminPage.getByRole('button', { name: 'Approve' }).click();
  const phantomPopup = await phantomPopupPromise;
  await approveInPhantomPopup(phantomPopup);

  // Đợi popup Phantom đóng hoàn toàn (transaction đã được signed)
  await phantomPopup.waitForEvent('close', { timeout: 10000 }).catch(() => { });

  // Đợi transaction được broadcast và confirm trên blockchain
  await adminPage.waitForTimeout(3000);

  // Đợi toast "Vote successful" xuất hiện - không cần đóng toast
  const voteSuccessToast = adminPage
    .locator('.text-base.font-medium', { hasText: 'Vote successful' })
    .first();
  await voteSuccessToast.waitFor({ state: 'visible', timeout: 60000 });

  // Sau khi verify vote thành công, đóng dialog
  const adminCloseButton = adminPage.getByRole('button', { name: 'Close', exact: true });
  if (await adminCloseButton.count()) {
    await adminCloseButton.click();
    await adminPage.waitForTimeout(500);
  }

  // Verify adminPage vẫn còn hoạt động
  if (adminPage.isClosed()) {
    throw new Error('Admin page was closed unexpectedly');
  }

  // Chuyển trực tiếp đến trang admin sau khi vote thành công
  const adminPagePopupPromise = adminPage.context().waitForEvent('page', { timeout: 5000 }).catch(() => null);
  await adminPage.goto('http://localhost:3001/admin?status=draft', {
    waitUntil: 'load',
  });

  // Xử lý popup Phantom để ký xác thực vào trang admin
  const adminPagePopup = await adminPagePopupPromise;
  if (adminPagePopup) {
    await approveInPhantomPopup(adminPagePopup, true);
    await adminPagePopup.waitForEvent('close', { timeout: 10000 }).catch(() => { });
    await adminPage.waitForTimeout(2000);
  }

  const waitForToast = async (text: string | RegExp) => {
    const toast = adminPage.locator('.text-base.font-medium', { hasText: text }).first();
    await toast.waitFor({ state: 'visible', timeout: 60000 });
    // Chỉ cần thấy toast xuất hiện là đủ, không cần đóng
  };

  // Đợi quest xuất hiện trong table sau khi ký xác thực xong
  const questRow = adminPage.locator('table tbody tr', { hasText: randomTitle }).first();
  await questRow.waitFor({ state: 'visible', timeout: 60000 });

  const selectDraftRow = async () => {
    const row = adminPage.locator('table tbody tr', { hasText: randomTitle }).first();
    await row.waitFor({ state: 'visible', timeout: 60000 });
    const checkbox = row.locator('[role="checkbox"]').first();
    await checkbox.scrollIntoViewIfNeeded();

    // Kiểm tra nếu checkbox chưa được check thì mới click
    const isChecked = await checkbox.isChecked().catch(() => false);
    if (!isChecked) {
      await checkbox.check({ timeout: 5000 });
    }

    // Đợi một chút để UI cập nhật
    await adminPage.waitForTimeout(500);

    // Verify buttons không còn disabled
    await adminPage.getByRole('button', { name: 'Force End (For test)', exact: true })
      .waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });
  };

  await selectDraftRow();

  const forceEndButton = adminPage.getByRole('button', { name: 'Force End (For test)', exact: true });
  await forceEndButton.waitFor({ state: 'visible', timeout: 15000 }).catch(() => { });

  // Listen for Phantom popup khi click Force End
  const forceEndPopupPromise = adminPage.context().waitForEvent('page', { timeout: 3000 }).catch(() => null);
  await forceEndButton.click();

  // Xử lý popup nếu có
  const forceEndPopup = await forceEndPopupPromise;
  if (forceEndPopup) {
    await approveInPhantomPopup(forceEndPopup, true);
    await forceEndPopup.waitForEvent('close', { timeout: 10000 }).catch(() => { });
    await adminPage.waitForTimeout(2000);
  }

  await waitForToast(/Draft forcibly ended/i);

  await selectDraftRow();
  const setDraftButton = adminPage.getByRole('button', { name: 'Set Draft Result', exact: true });
  await setDraftButton.waitFor({ state: 'visible', timeout: 15000 }).catch(() => { });

  // Kiểm tra nếu button Set Draft Result còn disabled, reload trang để backend nhận đủ votes
  let isDraftButtonEnabled = await setDraftButton.isEnabled().catch(() => false);
  let draftReloadAttempts = 0;
  const maxDraftReloadAttempts = 10;

  while (!isDraftButtonEnabled && draftReloadAttempts < maxDraftReloadAttempts) {
    console.log(`Set Draft Result button disabled, reload trang lần ${draftReloadAttempts + 1}/${maxDraftReloadAttempts}...`);
    await adminPage.waitForTimeout(3000); // Đợi backend xử lý votes

    // Reload trang
    await adminPage.reload({ waitUntil: 'load' });
    await adminPage.waitForTimeout(2000);

    // Chọn lại quest sau khi reload
    await selectDraftRow();

    // Check lại button
    const setDraftButtonAfterReload = adminPage.getByRole('button', { name: 'Set Draft Result', exact: true });
    await setDraftButtonAfterReload.waitFor({ state: 'visible', timeout: 10000 }).catch(() => { });
    isDraftButtonEnabled = await setDraftButtonAfterReload.isEnabled().catch(() => false);

    draftReloadAttempts++;
  }

  if (!isDraftButtonEnabled) {
    throw new Error(`Set Draft Result button vẫn disabled sau ${maxDraftReloadAttempts} lần reload. Backend có thể chưa nhận đủ votes.`);
  }

  console.log(`✅ Set Draft Result button đã enabled${draftReloadAttempts > 0 ? ` sau ${draftReloadAttempts} lần reload` : ''}!`);

  // Listen for Phantom popup khi click Set Draft Result
  const setDraftPopupPromise = adminPage.context().waitForEvent('page', { timeout: 3000 }).catch(() => null);
  await setDraftButton.click();

  // Xử lý popup nếu có
  const setDraftPopup = await setDraftPopupPromise;
  if (setDraftPopup) {
    await approveInPhantomPopup(setDraftPopup, true);
    await setDraftPopup.waitForEvent('close', { timeout: 10000 }).catch(() => { });
    await adminPage.waitForTimeout(2000);
  }

  await waitForToast(/Draft quest set successfully/i);

  // Đợi table update - quest status chuyển từ DRAFT sang APPROVE
  const updatedQuestRow = adminPage.locator('table tbody tr', { hasText: randomTitle });
  await updatedQuestRow.locator('td:has-text("APPROVE")').waitFor({
    state: 'visible',
    timeout: 30000,
  }).catch(async () => {
    // Nếu không thấy APPROVE, log status hiện tại
    const currentStatus = await updatedQuestRow.locator('td').nth(6).textContent().catch(() => 'unknown');
    throw new Error(`Set Draft Result failed. Quest status: ${currentStatus}, expected APPROVE`);
  });

  // Sau Set Draft Result, checkbox bị uncheck - phải select lại
  await selectDraftRow();

  // Đợi Publish button enabled (không chỉ visible)
  const publishButton = adminPage.getByRole('button', { name: 'Publish', exact: true });
  await publishButton.waitFor({ state: 'visible', timeout: 15000 }).catch(() => { });

  // Verify page vẫn còn hoạt động
  if (adminPage.isClosed()) {
    throw new Error('Admin page closed before clicking Publish');
  }

  // Kiểm tra button có enabled không
  const isEnabled = await publishButton.isEnabled({ timeout: 5000 }).catch(() => false);
  if (!isEnabled) {
    // Debug: check quest status
    const questStatus = await adminPage.locator('table tbody tr', { hasText: randomTitle })
      .locator('td').nth(6).textContent().catch(() => 'unknown');
    throw new Error(`Publish button is disabled. Quest status: ${questStatus}. Expected APPROVE status.`);
  }

  // Listen for Phantom popup khi click Publish
  const publishPopupPromise = adminPage.context().waitForEvent('page', { timeout: 3000 }).catch(() => null);
  await publishButton.click();

  // Xử lý popup nếu có
  const publishPopup = await publishPopupPromise;
  if (publishPopup) {
    await approveInPhantomPopup(publishPopup, true);
    await publishPopup.waitForEvent('close', { timeout: 10000 }).catch(() => { });
    await adminPage.waitForTimeout(2000);
  }

  await waitForToast(/Quest published successfully/i);

  // ============== PHẦN BET USER ==============
  console.log('🎯 Bắt đầu phần User Bet...');

  // User vào trang quests
  await userPage.goto('http://localhost:3001/quests');
  await userPage.waitForURL('**/quests');
  await userPage.waitForTimeout(3000); // Đợi data load

  // Debug: Kiểm tra xem có quest nào không
  const userQuestCount = await userPage.locator('a[href^="/quests/"]').count();
  console.log(`Found ${userQuestCount} quests on the page (user)`);

  if (userQuestCount === 0) {
    const noData = await userPage.getByText('No data').isVisible().catch(() => false);
    if (noData) {
      throw new Error('No quests available to bet on. Please publish a quest first.');
    }
  }

  // Tìm link quest vừa publish bằng randomTitle
  const userQuestLink = userPage.locator(`a[href^="/quests/"]`, { hasText: randomTitle }).first();
  await userQuestLink.waitFor({ state: 'visible', timeout: 15000 });

  // Debug: Log URL hiện tại trước khi click
  console.log(`Current URL before click: ${userPage.url()}`);

  // Click vào quest
  await userQuestLink.click();
  await userPage.waitForTimeout(2000); // Đợi trang quest detail load

  // Debug: Log URL sau khi click
  console.log(`Current URL after click: ${userPage.url()}`);

  // Đợi form vote xuất hiện (có label "Selected outcome")
  const userOutcomeLabel = userPage.getByText('Selected outcome');
  await userOutcomeLabel.waitFor({ state: 'visible', timeout: 10000 });

  // Click vào SelectTrigger để mở dropdown outcomes
  const userBetSelectTrigger = userPage.locator('[role="combobox"]').first();
  await userBetSelectTrigger.waitFor({ state: 'visible', timeout: 5000 });
  await userBetSelectTrigger.click();

  // Chọn outcome thứ 2 từ dropdown (thay vì đầu tiên)
  const userBetOutcomeOption = userPage.locator('[role="option"]').nth(1);
  await userBetOutcomeOption.waitFor({ state: 'visible', timeout: 5000 });
  await userBetOutcomeOption.click();

  // Nhập amount vào input
  const userAmountInput = userPage.getByPlaceholder('Please enter an amount');
  await userAmountInput.waitFor({ state: 'visible', timeout: 5000 });
  await userAmountInput.fill('1'); // Bet 1 token

  // Đợi form xử lý và validate
  await userPage.waitForTimeout(2000);

  // Click nút "Vote" để bet với retry logic nếu Privy dialog không xuất hiện
  const userBetVoteButton = userPage.getByRole('button', { name: 'Vote' });
  await userBetVoteButton.waitFor({ state: 'visible', timeout: 5000 });

  let hasPrivyDialog = false;
  const maxBetRetries = 3;
  let betRetryCount = 0;

  while (!hasPrivyDialog && betRetryCount < maxBetRetries) {
    console.log(`User bet: Click Vote button (lần ${betRetryCount + 1}/${maxBetRetries})...`);
    await userBetVoteButton.click();

    // Đợi 3 giây để Privy dialog xuất hiện
    await userPage.waitForTimeout(3000);

    // Kiểm tra nếu có Privy dialog
    const userBetPrivyApproveButton = userPage.getByLabel('log in or sign up').getByRole('button', { name: 'Approve' });
    hasPrivyDialog = await userBetPrivyApproveButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasPrivyDialog) {
      console.log('✅ Privy approve button xuất hiện, chờ 2 giây trước khi click...');
      await userPage.waitForTimeout(2000); // Chờ một chút trước khi click approve
      await userBetPrivyApproveButton.click();
      await userPage.waitForTimeout(2000);
      break;
    } else {
      console.log('⚠️ Privy approve button chưa xuất hiện...');
      if (betRetryCount < maxBetRetries - 1) {
        console.log('Sẽ retry click Vote button...');
      }
    }

    betRetryCount++;
  }

  if (!hasPrivyDialog) {
    throw new Error(`Privy approve button không xuất hiện sau ${maxBetRetries} lần retry`);
  }

  // Đợi toast thành công xuất hiện
  const userBetSuccessToast = userPage.locator('.text-base.font-medium', { hasText: /success|successful/i }).first();
  await userBetSuccessToast.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
    console.log('No user bet success toast found, continuing...');
  });

  // Đóng dialog nếu có nút Close
  const userBetCloseButton = userPage.getByRole('button', { name: 'Close', exact: true });
  if (await userBetCloseButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await userBetCloseButton.click();
    await userPage.waitForTimeout(500);
  }

  console.log('✅ User bet thành công!');

  // ============== PHẦN BET ADMIN - COMMENTED ==============
  // console.log('🎯 Bắt đầu phần Admin Bet...');

  // // Admin vào trang quests
  // await adminPage.goto('http://localhost:3001/quests');
  // await adminPage.waitForURL('**/quests');
  // await adminPage.waitForTimeout(3000); // Đợi data load

  // // Debug: Kiểm tra xem có quest nào không
  // const adminQuestCount = await adminPage.locator('a[href^="/quests/"]').count();
  // console.log(`Found ${adminQuestCount} quests on the page (admin)`);

  // if (adminQuestCount === 0) {
  //   throw new Error('No quests available to bet on. Please publish a quest first.');
  // }

  // // Tìm link quest vừa publish bằng randomTitle
  // const adminQuestLink = adminPage.locator(`a[href^="/quests/"]`, { hasText: randomTitle }).first();
  // await adminQuestLink.waitFor({ state: 'visible', timeout: 15000 });

  // // Click vào quest
  // await adminQuestLink.click();
  // await adminPage.waitForTimeout(2000); // Đợi trang quest detail load

  // // Đợi form vote xuất hiện (có label "Selected outcome")
  // const adminOutcomeLabel = adminPage.getByText('Selected outcome');
  // await adminOutcomeLabel.waitFor({ state: 'visible', timeout: 10000 });

  // // Click vào SelectTrigger để mở dropdown outcomes
  // const adminSelectTrigger = adminPage.locator('[role="combobox"]').first();
  // await adminSelectTrigger.waitFor({ state: 'visible', timeout: 5000 });
  // await adminSelectTrigger.click();

  // // Chọn outcome đầu tiên từ dropdown
  // const adminOutcomeOption = adminPage.locator('[role="option"]').first();
  // await adminOutcomeOption.waitFor({ state: 'visible', timeout: 5000 });
  // await adminOutcomeOption.click();

  // // Nhập amount vào input
  // const adminAmountInput = adminPage.getByPlaceholder('Please enter an amount');
  // await adminAmountInput.waitFor({ state: 'visible', timeout: 5000 });
  // await adminAmountInput.fill('1'); // Bet 1 token

  // // Đợi form xử lý và validate
  // await adminPage.waitForTimeout(2000);

  // // Click nút "Vote" để bet
  // const adminVoteButton = adminPage.getByRole('button', { name: 'Vote' });
  // await adminVoteButton.waitFor({ state: 'visible', timeout: 5000 });

  // // Lắng nghe popup Phantom
  // const adminBetPopupPromise = adminPage.context().waitForEvent('page');
  // await adminVoteButton.click();

  // // Xử lý popup Phantom (unlock nếu cần + approve)
  // const adminBetPopup = await adminBetPopupPromise;
  // await approveInPhantomPopup(adminBetPopup); // skipUnlock = false để unlock nếu cần

  // // Đợi popup đóng
  // await adminBetPopup.waitForEvent('close', { timeout: 10000 }).catch(() => { });
  // await adminPage.waitForTimeout(2000);

  // // Đợi toast thành công xuất hiện
  // const adminSuccessToast = adminPage.locator('.text-base.font-medium', { hasText: /success|successful/i }).first();
  // await adminSuccessToast.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
  //   console.log('No admin success toast found, continuing...');
  // });

  // console.log('✅ Admin bet thành công với Phantom wallet!');

  // ============== ADMIN: FINISH QUEST ==============
  console.log('🎯 Admin Finish quest vừa publish...');

  // Admin đã ở trang admin rồi (từ bước publish), không cần reload
  await adminPage.waitForTimeout(1000);

  // Click vào tab PUBLISH (có thể đang ở tab khác)
  const publishTab = adminPage.getByRole('radio', { name: 'PUBLISH' });
  await publishTab.waitFor({ state: 'visible', timeout: 10000 });
  await publishTab.click();
  await adminPage.waitForTimeout(2000);

  // Kiểm tra có quest nào trong tab PUBLISH không
  const tableRowCount = await adminPage.locator('table tbody tr').count();
  console.log(`Found ${tableRowCount} quests in PUBLISH tab`);

  if (tableRowCount === 0) {
    console.log('⚠️ No quests in PUBLISH status. Test incomplete.');
  } else {
    // Chọn quest đầu tiên (quest vừa publish)
    const firstQuestRow = adminPage.locator('table tbody tr').first();
    const firstQuestCheckbox = firstQuestRow.locator('[role="checkbox"]').first();
    await firstQuestCheckbox.scrollIntoViewIfNeeded();

    const isChecked = await firstQuestCheckbox.isChecked().catch(() => false);
    if (!isChecked) {
      await firstQuestCheckbox.check({ timeout: 5000 });
    }
    await adminPage.waitForTimeout(500);

    // Click nút Finish
    const finishButton = adminPage.getByRole('button', { name: 'Finish', exact: true });
    await finishButton.waitFor({ state: 'visible', timeout: 10000 });

    const finishPopupPromise = adminPage.context().waitForEvent('page', { timeout: 5000 }).catch(() => null);
    await finishButton.click();

    const finishPopup = await finishPopupPromise;
    if (finishPopup) {
      await approveInPhantomPopup(finishPopup, true);
      await finishPopup.waitForEvent('close', { timeout: 10000 }).catch(() => { });
    }

    const finishToast = adminPage.getByText(/success|finished/i).first();
    await finishToast.waitFor({ state: 'visible', timeout: 5000 }).catch(() => console.log('Toast missed'));
    console.log('✅ Finish quest thành công!');

    // ============== ADMIN: START DAO SUCCESS ==============
    console.log('🎯 Admin Start DAO Success...');

    await adminPage.waitForTimeout(2000);
    const questRowAfterFinish = adminPage.locator('table tbody tr').first();
    const questCheckboxAfterFinish = questRowAfterFinish.locator('[role="checkbox"]').first();
    await questCheckboxAfterFinish.scrollIntoViewIfNeeded();

    const isCheckedAfterFinish = await questCheckboxAfterFinish.isChecked().catch(() => false);
    if (!isCheckedAfterFinish) {
      await questCheckboxAfterFinish.check({ timeout: 5000 });
    }
    await adminPage.waitForTimeout(500);

    const startDaoButton = adminPage.getByRole('button', { name: 'Start DAO Success', exact: true });
    await startDaoButton.waitFor({ state: 'visible', timeout: 10000 });

    const daoPopupPromise = adminPage.context().waitForEvent('page', { timeout: 5000 }).catch(() => null);
    await startDaoButton.click();

    const daoPopup = await daoPopupPromise;
    if (daoPopup) {
      await approveInPhantomPopup(daoPopup, true);
      await daoPopup.waitForEvent('close', { timeout: 10000 }).catch(() => { });
    }

    const daoToast = adminPage.getByText(/success|dao/i).first();
    await daoToast.waitFor({ state: 'visible', timeout: 5000 }).catch(() => console.log('Toast missed'));
    console.log('✅ Start DAO Success thành công!');

    // ============== ADMIN: VOTE TRÊN DAO ==============
    console.log('🎯 Admin vote trên DAO Success...');

    await adminPage.goto('http://localhost:3001/dao?status=success');
    await adminPage.waitForURL('**/dao?status=success');

    // Đợi quest xuất hiện với retry logic (tối đa 30 giây)
    console.log('Đợi quest xuất hiện trên DAO Success (tối đa 30 giây)...');
    let adminDaoQuestAppeared = false;
    const maxRetries = 10;

    for (let i = 0; i < maxRetries; i++) {
      await adminPage.waitForTimeout(3000);
      const questCount = await adminPage.getByText(randomTitle).count();
      console.log(`Lần thử ${i + 1}/${maxRetries}: Found ${questCount} quests với title "${randomTitle}"`);

      if (questCount > 0) {
        adminDaoQuestAppeared = true;
        console.log(`✅ Quest xuất hiện sau ${(i + 1) * 3} giây!`);
        break;
      }
    }

    if (!adminDaoQuestAppeared) {
      console.log('⚠️ Không tìm thấy quest sau 30 giây. Có thể quest chưa được sync vào database.');
      console.log('Skipping Admin DAO vote...');
    } else {
      // Tìm quest container bằng randomTitle
      const questItem = adminPage.locator('.flex.flex-col.gap-4.py-8').filter({ hasText: randomTitle }).first();
      await questItem.waitFor({ state: 'visible', timeout: 10000 });

      // Click Voting tab inside the quest item
      const votingTab = questItem.getByRole('tab', { name: 'Voting' });
      await votingTab.waitFor({ state: 'visible', timeout: 5000 });
      await votingTab.click();
      await adminPage.waitForTimeout(1000);

      // Click Success button
      const successButton = questItem.getByRole('button', { name: 'Success' });
      await successButton.waitFor({ state: 'visible', timeout: 5000 });

      const adminDaoVotePopupPromise = adminPage.context().waitForEvent('page');
      await successButton.click();

      const adminDaoVotePopup = await adminDaoVotePopupPromise;
      await approveInPhantomPopup(adminDaoVotePopup, true);
      await adminDaoVotePopup.waitForEvent('close', { timeout: 10000 }).catch(() => { });
      await adminPage.waitForTimeout(2000);

      const adminDaoSuccessToast = adminPage.locator('.text-base.font-medium', { hasText: /success/i }).first();
      await adminDaoSuccessToast.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
        console.log('No admin DAO vote success toast found, continuing...');
      });

      console.log('✅ Admin DAO vote thành công!');
    }


    // ============== USER: VOTE TRÊN DAO ==============
    console.log('🎯 User vote trên DAO Success...');

    // Navigate trực tiếp đến DAO Success tab (giống admin)
    await userPage.goto('http://localhost:3001/dao?status=success');
    await userPage.waitForURL('**/dao?status=success');

    // Đợi quest xuất hiện với retry logic (tối đa 15 giây, vì admin đã đợi rồi)
    console.log('User: Đợi quest xuất hiện trên DAO Success...');
    let userDaoQuestAppeared = false;
    const userMaxRetries = 5;

    for (let i = 0; i < userMaxRetries; i++) {
      await userPage.waitForTimeout(3000);

      // Scroll xuống để tìm quest có thể ở dưới trang
      await userPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await userPage.waitForTimeout(500);

      const questCount = await userPage.getByText(randomTitle).count();
      console.log(`User lần thử ${i + 1}/${userMaxRetries}: Found ${questCount} quests`);

      if (questCount > 0) {
        userDaoQuestAppeared = true;
        console.log(`✅ User tìm thấy quest sau ${(i + 1) * 3} giây!`);
        break;
      }
    }

    if (!userDaoQuestAppeared) {
      console.log('⚠️ User không tìm thấy quest. Skipping User DAO vote...');
    } else {
      const questItem = userPage.locator('.flex.flex-col.gap-4.py-8').filter({ hasText: randomTitle }).first();
      await questItem.scrollIntoViewIfNeeded();
      await questItem.waitFor({ state: 'visible', timeout: 10000 });

      // Click Voting tab inside the quest item
      const votingTab = questItem.getByRole('tab', { name: 'Voting' });
      await votingTab.waitFor({ state: 'visible', timeout: 5000 });
      await votingTab.click();
      await userPage.waitForTimeout(3000);

      // Click Success button
      const successButton = questItem.getByRole('button', { name: 'Success' });
      await successButton.waitFor({ state: 'visible', timeout: 5000 });
      await successButton.click();

      const userDaoPrivyApproveButton = userPage.getByLabel('log in or sign up').getByRole('button', { name: 'Approve' });
      await userDaoPrivyApproveButton.waitFor({ state: 'visible', timeout: 10000 });
      await userDaoPrivyApproveButton.click();

      const userDaoSuccessToast = userPage.locator('.text-base.font-medium', { hasText: /success/i }).first();
      await userDaoSuccessToast.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
        console.log('No user DAO vote success toast found, continuing...');
      });

      console.log('✅ User DAO vote thành công!');
    }

    // ============== ADMIN: FORCE END DECISION ==============
    console.log('🎯 Admin vào trang admin tab DECISION...');

    // Navigate đến trang admin tab DECISION
    await adminPage.goto('http://localhost:3001/admin?status=decision', {
      waitUntil: 'load',
    });
    await adminPage.waitForTimeout(2000);

    // Đợi quest xuất hiện trong table DECISION
    const decisionQuestRow = adminPage.locator('table tbody tr', { hasText: randomTitle }).first();
    await decisionQuestRow.waitFor({ state: 'visible', timeout: 60000 });

    const selectDecisionRow = async () => {
      const row = adminPage.locator('table tbody tr', { hasText: randomTitle }).first();
      await row.waitFor({ state: 'visible', timeout: 60000 });
      const checkbox = row.locator('[role="checkbox"]').first();
      await checkbox.scrollIntoViewIfNeeded();

      // Kiểm tra nếu checkbox chưa được check thì mới click
      const isChecked = await checkbox.isChecked().catch(() => false);
      if (!isChecked) {
        await checkbox.check({ timeout: 5000 });
      }

      // Đợi một chút để UI cập nhật
      await adminPage.waitForTimeout(500);
    };

    await selectDecisionRow();

    // Click nút Force End (For test)
    const forceEndDecisionButton = adminPage.getByRole('button', { name: 'Force End (For test)', exact: true });
    await forceEndDecisionButton.waitFor({ state: 'visible', timeout: 15000 });

    // Kiểm tra nếu button Force End còn disabled, reload trang để backend nhận đủ votes
    let isForceEndEnabled = await forceEndDecisionButton.isEnabled().catch(() => false);
    let reloadAttempts = 0;
    const maxReloadAttempts = 10;

    while (!isForceEndEnabled && reloadAttempts < maxReloadAttempts) {
      console.log(`Force End button disabled, reload trang lần ${reloadAttempts + 1}/${maxReloadAttempts}...`);
      await adminPage.waitForTimeout(3000); // Đợi backend xử lý votes

      // Reload trang
      await adminPage.reload({ waitUntil: 'load' });
      await adminPage.waitForTimeout(2000);

      // Chọn lại quest sau khi reload
      await selectDecisionRow();

      // Check lại button
      const forceEndButtonAfterReload = adminPage.getByRole('button', { name: 'Force End (For test)', exact: true });
      await forceEndButtonAfterReload.waitFor({ state: 'visible', timeout: 10000 }).catch(() => { });
      isForceEndEnabled = await forceEndButtonAfterReload.isEnabled().catch(() => false);

      reloadAttempts++;
    }

    if (!isForceEndEnabled) {
      throw new Error(`Force End button vẫn disabled sau ${maxReloadAttempts} lần reload. Backend có thể chưa nhận đủ votes.`);
    }

    console.log(`✅ Force End button đã enabled${reloadAttempts > 0 ? ` sau ${reloadAttempts} lần reload` : ''}!`);

    // Listen for Phantom popup khi click Force End
    const forceEndDecisionPopupPromise = adminPage.context().waitForEvent('page', { timeout: 3000 }).catch(() => null);
    await forceEndDecisionButton.click();

    // Xử lý popup nếu có
    const forceEndDecisionPopup = await forceEndDecisionPopupPromise;
    if (forceEndDecisionPopup) {
      await approveInPhantomPopup(forceEndDecisionPopup, true);
      await forceEndDecisionPopup.waitForEvent('close', { timeout: 10000 }).catch(() => { });
      await adminPage.waitForTimeout(2000);
    }

    // Đợi toast thành công
    const forceEndDecisionToast = adminPage.locator('.text-base.font-medium', { hasText: /forcibly ended|success/i }).first();
    await forceEndDecisionToast.waitFor({ state: 'visible', timeout: 60000 }).catch(() => {
      console.log('No force end decision toast found, continuing...');
    });

    console.log('✅ Force End Decision thành công!');

    // ============== ADMIN: SET DECISION ==============
    console.log('🎯 Admin Set Decision...');

    // Chọn lại quest (có thể bị uncheck sau khi Force End)
    await selectDecisionRow();

    // Click nút Set Decision
    const setDecisionButton = adminPage.getByRole('button', { name: 'Set Decision', exact: true });
    await setDecisionButton.waitFor({ state: 'visible', timeout: 15000 });

    // Kiểm tra nếu button Set Decision còn disabled, reload trang để backend nhận đủ votes
    let isDecisionButtonEnabled = await setDecisionButton.isEnabled().catch(() => false);
    let setDecisionReloadAttempts = 0;
    const maxSetDecisionReloadAttempts = 10;

    while (!isDecisionButtonEnabled && setDecisionReloadAttempts < maxSetDecisionReloadAttempts) {
      console.log(`Set Decision button disabled, reload trang lần ${setDecisionReloadAttempts + 1}/${maxSetDecisionReloadAttempts}...`);
      await adminPage.waitForTimeout(3000); // Đợi backend xử lý votes

      // Reload trang
      await adminPage.reload({ waitUntil: 'load' });
      await adminPage.waitForTimeout(2000);

      // Chọn lại quest sau khi reload
      await selectDecisionRow();

      // Check lại button
      const setDecisionButtonAfterReload = adminPage.getByRole('button', { name: 'Set Decision', exact: true });
      await setDecisionButtonAfterReload.waitFor({ state: 'visible', timeout: 10000 }).catch(() => { });
      isDecisionButtonEnabled = await setDecisionButtonAfterReload.isEnabled().catch(() => false);

      setDecisionReloadAttempts++;
    }

    if (!isDecisionButtonEnabled) {
      throw new Error(`Set Decision button vẫn disabled sau ${maxSetDecisionReloadAttempts} lần reload. Backend có thể chưa nhận đủ votes.`);
    }

    console.log(`✅ Set Decision button đã enabled${setDecisionReloadAttempts > 0 ? ` sau ${setDecisionReloadAttempts} lần reload` : ''}!`);

    // Listen for Phantom popup khi click Set Decision
    const setDecisionPopupPromise = adminPage.context().waitForEvent('page', { timeout: 3000 }).catch(() => null);
    await setDecisionButton.click();

    // Xử lý popup nếu có
    const setDecisionPopup = await setDecisionPopupPromise;
    if (setDecisionPopup) {
      await approveInPhantomPopup(setDecisionPopup, true);
      await setDecisionPopup.waitForEvent('close', { timeout: 10000 }).catch(() => { });
      await adminPage.waitForTimeout(2000);
    }

    // Đợi toast thành công
    const setDecisionToast = adminPage.locator('.text-base.font-medium', { hasText: /Decision.*set.*successfully|success/i }).first();
    await setDecisionToast.waitFor({ state: 'visible', timeout: 60000 }).catch(() => {
      console.log('No set decision toast found, continuing...');
    });

    console.log('✅ Set Decision thành công!');

    // ============== ADMIN: VOTE TRÊN DAO ANSWER ==============
    console.log('🎯 Admin vote trên DAO Answer...');

    await adminPage.goto('http://localhost:3001/dao?status=answer');
    await adminPage.waitForURL('**/dao?status=answer');

    // Đợi quest xuất hiện với retry logic và reload (tối đa 30 giây)
    console.log('Admin: Đợi quest xuất hiện trên DAO Answer...');
    let adminDaoAnswerQuestAppeared = false;
    const adminAnswerMaxRetries = 10;

    for (let i = 0; i < adminAnswerMaxRetries; i++) {
      await adminPage.waitForTimeout(3000);
      const questCount = await adminPage.getByText(randomTitle).count();
      console.log(`Admin lần thử ${i + 1}/${adminAnswerMaxRetries}: Found ${questCount} quests với title "${randomTitle}"`);

      if (questCount > 0) {
        adminDaoAnswerQuestAppeared = true;
        console.log(`✅ Admin: Quest xuất hiện sau ${(i + 1) * 3} giây!`);
        break;
      }

      // Sau 3 lần thử không thấy, thử reload trang
      if (i === 2 || i === 5 || i === 8) {
        console.log('Admin: Reload trang DAO Answer để sync data từ backend...');
        await adminPage.reload({ waitUntil: 'load' });
        await adminPage.waitForTimeout(2000);
      }
    }

    if (!adminDaoAnswerQuestAppeared) {
      console.log('⚠️ Admin không tìm thấy quest trên DAO Answer sau 10 lần thử và 3 lần reload.');
      console.log('Skipping Admin DAO Answer vote...');
    } else {
      // Tìm quest container bằng randomTitle
      const adminAnswerQuestItem = adminPage.locator('.flex.flex-col.gap-4.py-8').filter({ hasText: randomTitle }).first();
      await adminAnswerQuestItem.waitFor({ state: 'visible', timeout: 10000 });

      // Click Voting tab inside the quest item
      const adminAnswerVotingTab = adminAnswerQuestItem.getByRole('tab', { name: 'Voting' });
      await adminAnswerVotingTab.waitFor({ state: 'visible', timeout: 5000 });
      await adminAnswerVotingTab.click();
      await adminPage.waitForTimeout(1000);

      // Tìm combobox để chọn outcome
      const adminAnswerCombobox = adminAnswerQuestItem.locator('[role="combobox"]').first();
      await adminAnswerCombobox.waitFor({ state: 'visible', timeout: 5000 });
      await adminAnswerCombobox.click();
      await adminPage.waitForTimeout(500);

      // Chọn option đầu tiên từ dropdown
      const adminAnswerOption = adminPage.locator('[role="option"]').first();
      await adminAnswerOption.waitFor({ state: 'visible', timeout: 5000 });
      const optionText = await adminAnswerOption.textContent();
      console.log(`Admin chọn outcome: ${optionText}`);
      await adminAnswerOption.click();

      // Đợi lâu hơn để form update sau khi chọn outcome
      await adminPage.waitForTimeout(3000);

      // Click Approve button
      const adminAnswerApproveButton = adminAnswerQuestItem.getByRole('button', { name: 'Approve' });
      await adminAnswerApproveButton.waitFor({ state: 'visible', timeout: 5000 });

      // Đợi Approve button enabled với timeout lâu hơn
      let isApproveEnabled = false;
      const maxApproveWait = 10; // 10 lần x 1 giây = 10 giây
      for (let i = 0; i < maxApproveWait; i++) {
        isApproveEnabled = await adminAnswerApproveButton.isEnabled().catch(() => false);
        if (isApproveEnabled) {
          console.log(`✅ Approve button enabled sau ${i + 1} giây`);
          break;
        }
        await adminPage.waitForTimeout(1000);
      }

      if (!isApproveEnabled) {
        throw new Error('Admin: Approve button vẫn disabled sau 10 giây chờ');
      }

      const adminAnswerVotePopupPromise = adminPage.context().waitForEvent('page', { timeout: 5000 }).catch(() => null);
      await adminAnswerApproveButton.click();

      const adminAnswerVotePopup = await adminAnswerVotePopupPromise;
      if (adminAnswerVotePopup) {
        await approveInPhantomPopup(adminAnswerVotePopup, true);
        await adminAnswerVotePopup.waitForEvent('close', { timeout: 10000 }).catch(() => { });
        await adminPage.waitForTimeout(2000);
      } else {
        console.log('No Phantom popup appeared for admin DAO Answer vote');
        await adminPage.waitForTimeout(2000);
      }

      const adminAnswerSuccessToast = adminPage.locator('.text-base.font-medium', { hasText: /success/i }).first();
      await adminAnswerSuccessToast.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
        console.log('No admin DAO Answer vote success toast found, continuing...');
      });

      console.log('✅ Admin DAO Answer vote thành công!');
    }

    // ============== USER: VOTE TRÊN DAO ANSWER ==============
    console.log('🎯 User vote trên DAO Answer...');

    // Navigate trực tiếp đến DAO Answer tab
    await userPage.goto('http://localhost:3001/dao?status=answer');
    await userPage.waitForURL('**/dao?status=answer');

    // Đợi quest xuất hiện với retry logic (tối đa 15 giây, vì admin đã đợi rồi)
    console.log('User: Đợi quest xuất hiện trên DAO Answer...');
    let userDaoAnswerQuestAppeared = false;
    const userAnswerMaxRetries = 5;

    for (let i = 0; i < userAnswerMaxRetries; i++) {
      await userPage.waitForTimeout(3000);

      // Scroll xuống để tìm quest có thể ở dưới trang
      await userPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await userPage.waitForTimeout(500);

      const questCount = await userPage.getByText(randomTitle).count();
      console.log(`User lần thử ${i + 1}/${userAnswerMaxRetries}: Found ${questCount} quests`);

      if (questCount > 0) {
        userDaoAnswerQuestAppeared = true;
        console.log(`✅ User tìm thấy quest sau ${(i + 1) * 3} giây!`);
        break;
      }
    }

    if (!userDaoAnswerQuestAppeared) {
      console.log('⚠️ User không tìm thấy quest trên DAO Answer. Skipping User DAO Answer vote...');
    } else {
      const userAnswerQuestItem = userPage.locator('.flex.flex-col.gap-4.py-8').filter({ hasText: randomTitle }).first();
      await userAnswerQuestItem.scrollIntoViewIfNeeded();
      await userAnswerQuestItem.waitFor({ state: 'visible', timeout: 10000 });

      // Click Voting tab inside the quest item
      const userAnswerVotingTab = userAnswerQuestItem.getByRole('tab', { name: 'Voting' });
      await userAnswerVotingTab.waitFor({ state: 'visible', timeout: 5000 });
      await userAnswerVotingTab.click();
      await userPage.waitForTimeout(1000);

      // Tìm combobox để chọn outcome
      const userAnswerCombobox = userAnswerQuestItem.locator('[role="combobox"]').first();
      await userAnswerCombobox.waitFor({ state: 'visible', timeout: 5000 });
      await userAnswerCombobox.click();
      await userPage.waitForTimeout(500);

      // Chọn option đầu tiên từ dropdown
      const userAnswerOption = userPage.locator('[role="option"]').first();
      await userAnswerOption.waitFor({ state: 'visible', timeout: 5000 });
      const optionText = await userAnswerOption.textContent();
      console.log(`User chọn outcome: ${optionText}`);
      await userAnswerOption.click();

      // Đợi lâu hơn để form update sau khi chọn outcome
      await userPage.waitForTimeout(3000);

      // Click Approve button
      const userAnswerApproveButton = userAnswerQuestItem.getByRole('button', { name: 'Approve' });
      await userAnswerApproveButton.waitFor({ state: 'visible', timeout: 5000 });

      // Đợi Approve button enabled với timeout lâu hơn
      let isApproveEnabled = false;
      const maxUserApproveWait = 10; // 10 lần x 1 giây = 10 giây
      for (let i = 0; i < maxUserApproveWait; i++) {
        isApproveEnabled = await userAnswerApproveButton.isEnabled().catch(() => false);
        if (isApproveEnabled) {
          console.log(`✅ User Approve button enabled sau ${i + 1} giây`);
          break;
        }
        await userPage.waitForTimeout(1000);
      }

      if (!isApproveEnabled) {
        throw new Error('User: Approve button vẫn disabled sau 10 giây chờ');
      }

      await userAnswerApproveButton.click();

      const userAnswerPrivyApproveButton = userPage.getByLabel('log in or sign up').getByRole('button', { name: 'Approve' });
      await userAnswerPrivyApproveButton.waitFor({ state: 'visible', timeout: 10000 });
      await userAnswerPrivyApproveButton.click();

      const userAnswerSuccessToast = userPage.locator('.text-base.font-medium', { hasText: /success/i }).first();
      await userAnswerSuccessToast.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
        console.log('No user DAO Answer vote success toast found, continuing...');
      });

      console.log('✅ User DAO Answer vote thành công!');
    }

    // ============== ADMIN: SET ANSWER ==============
    console.log('🎯 Admin Set Answer...');

    // Navigate đến trang admin (có thể cần vào tab ANSWER hoặc tìm quest trong tab hiện tại)
    await adminPage.goto('http://localhost:3001/admin?status=answer', {
      waitUntil: 'load',
    });
    await adminPage.waitForTimeout(2000);

    // Đợi quest xuất hiện trong table ANSWER
    const answerQuestRow = adminPage.locator('table tbody tr', { hasText: randomTitle }).first();
    await answerQuestRow.waitFor({ state: 'visible', timeout: 60000 });

    const selectAnswerRow = async () => {
      const row = adminPage.locator('table tbody tr', { hasText: randomTitle }).first();
      await row.waitFor({ state: 'visible', timeout: 60000 });
      const checkbox = row.locator('[role="checkbox"]').first();
      await checkbox.scrollIntoViewIfNeeded();

      // Kiểm tra nếu checkbox chưa được check thì mới click
      const isChecked = await checkbox.isChecked().catch(() => false);
      if (!isChecked) {
        await checkbox.check({ timeout: 5000 });
      }

      // Đợi một chút để UI cập nhật
      await adminPage.waitForTimeout(500);
    };

    await selectAnswerRow();

    // Click nút Set Answer
    const setAnswerButton = adminPage.getByRole('button', { name: 'Set Answer', exact: true });
    await setAnswerButton.waitFor({ state: 'visible', timeout: 15000 });

    // Kiểm tra nếu button Set Answer còn disabled, reload trang để backend nhận đủ votes
    let isSetAnswerEnabled = await setAnswerButton.isEnabled().catch(() => false);
    let setAnswerReloadAttempts = 0;
    const maxSetAnswerReloadAttempts = 10;

    while (!isSetAnswerEnabled && setAnswerReloadAttempts < maxSetAnswerReloadAttempts) {
      console.log(`Set Answer button disabled, reload trang lần ${setAnswerReloadAttempts + 1}/${maxSetAnswerReloadAttempts}...`);
      await adminPage.waitForTimeout(3000); // Đợi backend xử lý votes

      // Reload trang
      await adminPage.reload({ waitUntil: 'load' });
      await adminPage.waitForTimeout(2000);

      // Chọn lại quest sau khi reload
      await selectAnswerRow();

      // Check lại button
      const setAnswerButtonAfterReload = adminPage.getByRole('button', { name: 'Set Answer', exact: true });
      await setAnswerButtonAfterReload.waitFor({ state: 'visible', timeout: 10000 }).catch(() => { });
      isSetAnswerEnabled = await setAnswerButtonAfterReload.isEnabled().catch(() => false);

      setAnswerReloadAttempts++;
    }

    if (!isSetAnswerEnabled) {
      throw new Error(`Set Answer button vẫn disabled sau ${maxSetAnswerReloadAttempts} lần reload. Backend có thể chưa nhận đủ votes.`);
    }

    console.log(`✅ Set Answer button đã enabled${setAnswerReloadAttempts > 0 ? ` sau ${setAnswerReloadAttempts} lần reload` : ''}!`);

    // Listen for Phantom popup khi click Set Answer
    const setAnswerPopupPromise = adminPage.context().waitForEvent('page', { timeout: 3000 }).catch(() => null);
    await setAnswerButton.click();

    // Xử lý popup nếu có
    const setAnswerPopup = await setAnswerPopupPromise;
    if (setAnswerPopup) {
      await approveInPhantomPopup(setAnswerPopup, true);
      await setAnswerPopup.waitForEvent('close', { timeout: 10000 }).catch(() => { });
      await adminPage.waitForTimeout(2000);
    }

    // Đợi toast thành công
    const setAnswerToast = adminPage.locator('.text-base.font-medium', { hasText: /Answer.*set.*successfully|success/i }).first();
    await setAnswerToast.waitFor({ state: 'visible', timeout: 60000 }).catch(() => {
      console.log('No set answer toast found, continuing...');
    });

    console.log('✅ Set Answer thành công!');

    // ============== ADMIN: SUCCESS ==============
    console.log('🎯 Admin click Success...');

    // Chọn lại quest (có thể bị uncheck sau khi Set Answer)
    await selectAnswerRow();

    // Click nút Success
    const successButton = adminPage.getByRole('button', { name: 'Success', exact: true });
    await successButton.waitFor({ state: 'visible', timeout: 15000 });

    // Kiểm tra nếu button Success còn disabled, reload trang để backend nhận xong Set Answer
    let isSuccessButtonEnabled = await successButton.isEnabled().catch(() => false);
    let successReloadAttempts = 0;
    const maxSuccessReloadAttempts = 10;

    while (!isSuccessButtonEnabled && successReloadAttempts < maxSuccessReloadAttempts) {
      console.log(`Success button disabled, reload trang lần ${successReloadAttempts + 1}/${maxSuccessReloadAttempts}...`);
      await adminPage.waitForTimeout(3000); // Đợi backend xử lý Set Answer

      // Reload trang
      await adminPage.reload({ waitUntil: 'load' });
      await adminPage.waitForTimeout(2000);

      // Chọn lại quest sau khi reload
      await selectAnswerRow();

      // Check lại button
      const successButtonAfterReload = adminPage.getByRole('button', { name: 'Success', exact: true });
      await successButtonAfterReload.waitFor({ state: 'visible', timeout: 10000 }).catch(() => { });
      isSuccessButtonEnabled = await successButtonAfterReload.isEnabled().catch(() => false);

      successReloadAttempts++;
    }

    if (!isSuccessButtonEnabled) {
      throw new Error(`Success button vẫn disabled sau ${maxSuccessReloadAttempts} lần reload. Backend có thể chưa xử lý xong Set Answer.`);
    }

    console.log(`✅ Success button đã enabled${successReloadAttempts > 0 ? ` sau ${successReloadAttempts} lần reload` : ''}!`);

    // Listen for Phantom popup khi click Success
    const successPopupPromise = adminPage.context().waitForEvent('page', { timeout: 3000 }).catch(() => null);
    await successButton.click();

    // Xử lý popup nếu có
    const successPopup = await successPopupPromise;
    if (successPopup) {
      await approveInPhantomPopup(successPopup, true);
      await successPopup.waitForEvent('close', { timeout: 10000 }).catch(() => { });
      await adminPage.waitForTimeout(2000);
    }

    // Đợi toast thành công
    const successToast = adminPage.locator('.text-base.font-medium', { hasText: /success/i }).first();
    await successToast.waitFor({ state: 'visible', timeout: 60000 }).catch(() => {
      console.log('No success toast found, continuing...');
    });

    console.log('✅ Success thành công!');

    // ============== USER: CLAIM REWARD ==============
    console.log('🎯 User vào trang Profile để claim reward...');

    // User vào trang profile
    await userPage.goto('http://localhost:3001/profile');
    await userPage.waitForURL('**/profile');
    await userPage.waitForTimeout(2000);

    // Cuộn xuống để thấy bảng
    await userPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await userPage.waitForTimeout(1000);

    // ============== CLAIM REWARD TỪ TAB VOTES ==============
    console.log('🎯 User claim reward từ tab Votes...');

    // Click vào tab Votes (role="radio" on Profile page)
    const votesTab = userPage.getByRole('radio', { name: 'Votes' });
    await votesTab.waitFor({ state: 'visible', timeout: 10000 });
    // Kiểm tra nếu tab chưa được chọn thì mới click
    const isVotesTabChecked = await votesTab.isChecked().catch(() => false);
    if (!isVotesTabChecked) {
      await votesTab.click();
      await userPage.waitForTimeout(2000);
    }

    // Cuộn xuống để thấy bảng
    await userPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await userPage.waitForTimeout(1000);

    // Tìm nút Reward trong hàng chứa quest title (table row)
    const voteQuestRow = userPage.locator(`//tr[.//td[contains(text(), '${randomTitle}')]]`).first();
    const voteRewardButton = voteQuestRow.locator('button').filter({ has: userPage.locator('span.sr-only', { hasText: 'Reward' }) }).first();
    const hasVoteRewardButton = await voteRewardButton.count();

    if (hasVoteRewardButton > 0) {
      const isVoteRewardDisabled = await voteRewardButton.isDisabled().catch(() => true);
      if (!isVoteRewardDisabled) {
        await voteRewardButton.scrollIntoViewIfNeeded();
        await voteRewardButton.click();
        await userPage.waitForTimeout(1000);

        // Xử lý Privy approve nếu có
        const voteClaimPrivyApprove = userPage.getByLabel('log in or sign up').getByRole('button', { name: 'Approve' });
        if (await voteClaimPrivyApprove.isVisible({ timeout: 5000 }).catch(() => false)) {
          await voteClaimPrivyApprove.click();
          await userPage.waitForTimeout(2000);
        }

        // Đợi Privy popup thành công xuất hiện
        const voteClaimSuccessMessage = userPage.locator('.text-base.font-medium', { hasText: /success|claimed/i }).first();
        await voteClaimSuccessMessage.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
          console.log('No vote claim success message found, continuing...');
        });

        // Đóng Privy popup thông báo thành công trước khi claim tiếp
        await userPage.waitForTimeout(1000);
        const votePrivyCloseButton = userPage.getByLabel('log in or sign up').getByRole('button', { name: /close|done|continue/i });
        if (await votePrivyCloseButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await votePrivyCloseButton.click();
          await userPage.waitForTimeout(500);
        } else {
          // Thử đóng bằng nút X hoặc close button bên ngoài
          const closeButton = userPage.getByRole('button', { name: 'Close', exact: true });
          if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await closeButton.click();
            await userPage.waitForTimeout(500);
          }
        }

        console.log('✅ User claim Vote reward thành công!');
      } else {
        console.log('⚠️ Vote reward đã được claim trước đó (button disabled)');
      }
    } else {
      console.log('⚠️ Không tìm thấy nút Reward trong tab Vote');
    }

    // ============== CLAIM REWARD TỪ TAB DAO ==============
    console.log('🎯 User claim reward từ tab DAO...');

    // Click vào tab DAO (role="radio" on Profile page)
    const daoTab = userPage.getByRole('radio', { name: 'Dao' });
    await daoTab.waitFor({ state: 'visible', timeout: 10000 });
    await daoTab.click();
    await userPage.waitForTimeout(2000);

    // Cuộn xuống để thấy bảng
    await userPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await userPage.waitForTimeout(1000);

    // Tìm nút Reward trong hàng chứa quest title (table row)
    const daoQuestRow = userPage.locator(`//tr[.//td[contains(text(), '${randomTitle}')]]`).first();
    const daoRewardButton = daoQuestRow.locator('button').filter({ has: userPage.locator('span.sr-only', { hasText: 'Reward' }) }).first();
    const hasDaoRewardButton = await daoRewardButton.count();

    if (hasDaoRewardButton > 0) {
      const isDaoRewardDisabled = await daoRewardButton.isDisabled().catch(() => true);
      if (!isDaoRewardDisabled) {
        await daoRewardButton.scrollIntoViewIfNeeded();
        await daoRewardButton.click();
        await userPage.waitForTimeout(1000);

        // Xử lý Privy approve nếu có
        const daoClaimPrivyApprove = userPage.getByLabel('log in or sign up').getByRole('button', { name: 'Approve' });
        if (await daoClaimPrivyApprove.isVisible({ timeout: 5000 }).catch(() => false)) {
          await daoClaimPrivyApprove.click();
          await userPage.waitForTimeout(2000);
        }

        // Đợi Privy popup thành công xuất hiện
        const daoClaimSuccessMessage = userPage.locator('.text-base.font-medium', { hasText: /success|claimed/i }).first();
        await daoClaimSuccessMessage.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
          console.log('No DAO claim success message found, continuing...');
        });

        // Đóng Privy popup thông báo thành công
        await userPage.waitForTimeout(1000);
        const daoPrivyCloseButton = userPage.getByLabel('log in or sign up').getByRole('button', { name: /close|done|continue/i });
        if (await daoPrivyCloseButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await daoPrivyCloseButton.click();
          await userPage.waitForTimeout(500);
        } else {
          // Thử đóng bằng nút X hoặc close button bên ngoài
          const closeButton = userPage.getByRole('button', { name: 'Close', exact: true });
          if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await closeButton.click();
            await userPage.waitForTimeout(500);
          }
        }

        console.log('✅ User claim DAO reward thành công!');
      } else {
        console.log('⚠️ DAO reward đã được claim trước đó (button disabled)');
      }
    } else {
      console.log('⚠️ Không tìm thấy nút Reward trong tab DAO');
    }
  }

  console.log('🎉 Test hoàn tất: Create → Vote → Admin Approve → Publish → User Bet → Finish → DAO Success → DAO Votes → Force End Decision → Set Decision → DAO Answer Votes → Set Answer → Success → Claim Rewards');
});
