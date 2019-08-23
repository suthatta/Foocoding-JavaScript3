'use strict';

{
  function fetchJSON(url, cb) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = () => {
      if (xhr.status < 400) {
        cb(null, xhr.response);
      } else {
        cb(new Error(`Network error: ${xhr.status} - ${xhr.statusText}`));
      }
    };
    xhr.onerror = () => cb(new Error('Network request failed'));
    xhr.send();
  }

  function createAndAppend(name, parent, options = {}) {
    const elem = document.createElement(name);
    parent.appendChild(elem);
    Object.keys(options).forEach(key => {
      const value = options[key];
      if (key === 'text') {
        elem.textContent = value;
      } else {
        elem.setAttribute(key, value);
      }
    });
    return elem;
  }
  //header

  function createAnRepoList(array) {
    createAndAppend('header', root, { class: 'header' });
    let header = document.getElementsByClassName('header')[0];
    createAndAppend('p', header, { text: 'HYF Repositories' });
    createAndAppend('select', header, { class: 'repo-selector', id: 'RepoList' });
    let listRoot = document.getElementById('RepoList');
    for (let i = 0; i < array.length; i++) {
      createAndAppend('option', listRoot, { text: array[i].name, value: i });
    }
  }

  function selectInfo(arr) {
    const root = document.getElementById('root');
    createAndAppend('div', root, { class: 'header', id: 'header' });
    let header = document.getElementsByClassName('header')[0];
    createAndAppend('h1', header, { text: 'HYF Repositories' });
    createAndAppend('select', header, { class: 'repo-selector', id: 'RepoList' });
    const listRoot = document.getElementById('RepoList');

    for (let i = 0; i < arr.length; i++) {
      createAndAppend('option', listRoot, { text: arr[i].name, value: i });
    }
  }
  //left
  function createRepo(element) {
    const container = document.querySelector('#container');
    //creating table for repository overwiew
    let table = createAndAppend('table', container, {
      id: 'RepositoryOverview',
      class: 'leftDiv whiteFrame',
    });
    let repoRow = createAndAppend('tr', table);
    //creating row for repository and link
    createAndAppend('td', repoRow, { text: 'Repository:', style: 'font-weight:bold' });
    let repoLink = createAndAppend('td', repoRow);
    createAndAppend('a', repoLink, {
      href: element.html_url,
      text: element.name,
      target: '_blank',
    });
    //creating row for repo description
    let descriptionRow = createAndAppend('tr', table);
    createAndAppend('td', descriptionRow, { text: 'Description:', style: 'font-weight:bold' });
    createAndAppend('td', descriptionRow, { text: element.description });
    //creating row for forks
    let forkRow = createAndAppend('tr', table);
    createAndAppend('td', forkRow, { text: 'Fork:', style: 'font-weight:bold' });
    createAndAppend('td', forkRow, { text: element.forks_count });
    // creating 'last time updated' row
    let updatedRow = createAndAppend('tr', table);
    createAndAppend('td', updatedRow, { text: 'Updated:', style: 'font-weight:bold' });
    let date = new Date(element.updated_at);
    date = date.toUTCString();
    createAndAppend('td', updatedRow, { text: date });
    //const repolist = getElementByClassName('left-div');
  }
  //right

  function createContributor(element) {
    fetchJSON(element.contributors_url, (err, data) => {
      const root = document.getElementById('container');
      if (err) {
        createAndAppend('div', root, { text: err.message, class: 'alert-error' });
      } else {
        let contributors = createAndAppend('div', root, {
          id: 'contributors',
          class: 'rightDiv whiteFrame',
        });
        createAndAppend('p', contributors, { class: 'contributorsHeader', text: 'Contributors' });

        let ul = createAndAppend('ul', contributors, { class: 'contributorsList' });
        for (let i = 0; i < data.length; i++) {
          let li = createAndAppend('li', ul, { class: 'contributorItem' });
          let img = createAndAppend('img', li, {
            src: data[i].avatar_url,
            class: 'contributorsAvatar',
            height: 48,
          });
          let login = createAndAppend('a', li, {
            text: data[i].login,
            href: data[i].html_url,
            target: '_blank',
            class: 'contributorName',
          });
          let badge = createAndAppend('div', li, {
            text: data[i].contributions,
            class: 'contributorBadge',
          });
        }
      }
    });
  }

  //main for run program
  function main(url) {
    fetchJSON(url, (err, data) => {
      const root = document.getElementById('root');
      if (err) {
        createAndAppend('div', root, { text: err.message, class: 'alert-error' });
      } else {
        data.sort(function(item1, item2) {
          if (item1.name.toUpperCase() < item2.name.toUpperCase()) return -1;
          if (item1.name > item2.name) return 1;
          return 0;
        });

        //Show Header
        selectInfo(data);
        //Create and show Container left-right
        createAndAppend('div', root, { id: 'container', class: 'container' });
        //left-side
        createRepo(data[0]);
        //right-side
        createContributor(data[0]);

        //change value if select repo in drop down

        document.getElementById('RepoList').onchange = function() {
          let selectedItem = this.options[this.selectedIndex].value;
          let table = document.getElementById('RepositoryOverview');
          table.parentNode.removeChild(table);
          let contributors = document.getElementById('contributors');
          contributors.parentNode.removeChild(contributors);

          createRepo(data[selectedItem]);
          createContributor(data[selectedItem]);
        };
      }
    });
  }

  const HYF_REPOS_URL = 'https://api.github.com/orgs/HackYourFuture/repos?per_page=100';

  window.onload = () => main(HYF_REPOS_URL);
}
