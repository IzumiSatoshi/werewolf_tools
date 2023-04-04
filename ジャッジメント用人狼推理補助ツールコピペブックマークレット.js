javascript: (function () {
  function getRoles() {
    /* 役職を取得 */
    /* [{roleName:'占い師', actors: ['アンナ','ローラ']}]*/
    const table = document.querySelector('#MEMO_MAIN_LEFTCONTAINER > table');
    const roleData = [];
    const rows = table.querySelectorAll('tbody > tr');
    let currentRoleName = '';

    Array.from(rows).forEach((row) => {
      const roleNameCell = row.querySelector('.role-name');
      const memoMainActorCell = row.querySelector('.memo-main-actor');
      if (roleNameCell) {
        currentRoleName = roleNameCell.textContent.trim();
      }
      if (memoMainActorCell && currentRoleName) {
        const actorName = memoMainActorCell.textContent.trim();
        const roleEntry = roleData.find(
          (entry) => entry.roleName === currentRoleName
        );
        if (roleEntry) {
          roleEntry.actors.push(actorName);
        } else {
          roleData.push({ roleName: currentRoleName, actors: [actorName] });
        }
      }
    });
    return roleData;
  }

  function getResult(role, actor) {
    /* 役職持ちから結果を取得*/
    /* -1→占い無し、0→白、1→黒*/
    /* [{targetName:'マリアンヌ', result:0}]*/

    /*actor_nameを表の行に変換*/
    /* 0:吊り、1:噛み、2:空白*/
    const row_idx = 3 + roleData[0].actors.indexOf(actor);
    const table = document.querySelector('#MEMO_MAIN_RIGHTCONTAINER > table');
    const row = Array.from(table.querySelectorAll('tbody > tr'))[row_idx];
    const rowCells = Array.from(row.querySelectorAll('td'));
    let currentTargetName = '';
    let resultData = [];

    rowCells.forEach((cell) => {
      if (cell.className == 'memo-main-target') {
        currentTargetName = cell.textContent.trim();
      }
      if (cell.className == 'memo-main-note' && currentTargetName) {
        let res = 0;
        if (cell.textContent.trim() == '○') {
          res = 0;
        }else if (cell.textContent.trim() == '●') {
          res = 1;
        }else{
          res = -1;
        }
        resultData.push({ targetName: currentTargetName, result: res });
      }
    });
    return resultData;
  }

  function getGrays() {
    const dlElement = document.querySelector(
      '#MEMO_ANALYZED_FORTUNETELLERS_RESULTS'
    );
    const dtElements = dlElement.querySelectorAll('dt');
    const targetDt = Array.from(dtElements).find(
      (dt) => dt.textContent.trim() === 'グレー'
    );

    let grays = [];
    if (targetDt) {
      const targetDd = targetDt.nextElementSibling;
      const liElements = targetDd.querySelectorAll('ul > li');

      liElements.forEach((li, index) => {
        grays.push(li.textContent.trim());
      });
    }
    return grays;
  }

  let outputStr = '';
  /* 占い先を書いていく */
  const roleData = getRoles();

  outputStr += '【占い結果】\n';

  /* ジャッジメントの二日目が0 */
  const currentDay =
    getResult('占い師', roleData[0].actors[0], roleData).length - 1;

  for (let d = 1; d <= currentDay; d++) {
    outputStr += `<${d}日目>\n`;
    roleData.forEach((oneRole) => {
      if (oneRole.roleName == '占い師') {
        oneRole.actors.forEach((actor) => {
          const resultData = getResult('占い師', actor, roleData);
          let dayResult = resultData[d - 1];
          let targetName = dayResult.targetName;
          let resultStr = '○';
          if (dayResult.result == 0) {
            resultStr = '○';
          }else if(dayResult.result == 1){
            resultStr = '●';
          }else{
            resultStr = '';
          }
          outputStr += `${actor}→${targetName}${resultStr}\n`;
        });
      }
    });
  }

  /* グレーを書いていく */
  const grays = getGrays();
  outputStr += '【完全グレー】\n';
  grays.forEach((gray, index, array) => {
    if (index !== array.length - 1) {
      /* normal loop */
      outputStr += `${gray},`;
    } else {
      /* last loop */
      outputStr += `${gray}\n`;
    }
  });

  /* 最後にクリップボードへ。フォーカスが当たってないとエラーが起きるので、二度押すこと。成功するとアラートが出る。 */
  try {
    navigator.clipboard.writeText(outputStr).then(function () {
      alert(outputStr);
    });
  } catch {}
})();
