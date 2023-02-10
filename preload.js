let loading
let listContainer
let quickIndexIdentity
let isFirstSearch = true

const debouncedSetList = debounce(setList, 500)

window.exports = {
  "abbreviation": {
    mode: "list",
    args: {
      enter: async (action, callbackSetList) => {
        const term = action.payload

        const styleEl = document.createElement('style')
        styleEl.textContent = getStyle()
        document.head.appendChild(styleEl)

        listContainer = document.querySelector('#root > .list > div')
        quickIndexIdentity = document.querySelector('.quick-index-identity')

        loading = document.createElement('div')
        loading.innerHTML = `
          <div class="list-item" style="padding: 0">
            <div class="list-item-content utools-abbreviations" style="padding: 0">
              <div class="loading-container">
                <div class="loading"></div>
              </div>
            </div>
          </div>
        `
        loading = loading.children[0]
        listContainer.appendChild(loading)

        window.requestAnimationFrame(() => {
          utools.setSubInputValue(term)
        })
      },
      search: (action, searchWord, callbackSetList) => {
        if (!searchWord.trim().length) return

        if (isFirstSearch) {
          setList(searchWord, callbackSetList)
          isFirstSearch = false
        } else {
          debouncedSetList(searchWord, callbackSetList)
        }
      },
      select: (action, itemData, callbackSetList) => {
        if (itemData?.title) {
          utools.copyText(itemData.title.toLocaleLowerCase())
        }
        utools.hideMainWindow()
        utools.outPlugin()
      },
    }
  }
}

function debounce(fn, wait) {
  let timerId = null

  return (...args) => {
    if (timerId) {
      clearTimeout(timerId)
      timerId = null
    }

    timerId = setTimeout(() => {
      fn(...args)
      timerId = null
    }, wait)
  }
}


function getRatingStars(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

async function setList(term, callbackSetList) {
  try {
    showLoading()
    const abbvs = await fetchAbbreviations(term)
    hideLoading()

    if (abbvs.length <= 0) {
      callbackSetList([{ title: '无结果...' }])
      return
    }

    callbackSetList(abbvs.map(abbv => (
      {
        title: abbv.term,
        description: `${getRatingStars(abbv.rating)} ${abbv.definition}, ${abbv.category.replaceAll('&raquo;', '»')}`
      }
    )))

  } catch (e) {
    hideLoading()
    callbackSetList([{ title: '查询失败', description: e.message }])
  }
}


function showLoading() {
  loading.style.display = 'flex'
  quickIndexIdentity.style.display = 'none'
  utools.setExpendHeight(48)
}

function hideLoading() {
  loading.style.display = 'none'
  quickIndexIdentity.style.display = 'block'
}

async function fetchAbbreviations(word) {
  return fetch(`https://various-api.vercel.app/api/abbreviations?word=${word}`).then(res => res.json())
}

function getStyle() {
  return `
    .utools-abbreviations .loading-container {
      display: flex;
      justify-content: center;
      height: 100%;
    }

    .utools-abbreviations .loading {
      position: relative;
      top: 16px;
      left: -9999px;
      width: 8px;
      height: 8px;
      border-radius: 5px;
      background-color: #8e8e8e;
      color: #8e8e8e;
      box-shadow: 9999px 0 0 -5px;
      animation: dot-pulse 1.5s infinite linear;
      animation-delay: 0.25s;
    }

    .utools-abbreviations .loading::before,
    .utools-abbreviations .loading::after {
      content: '';
      display: inline-block;
      position: absolute;
      top: 0;
      width: 8px;
      height: 8px;
      border-radius: 5px;
      background-color: #8e8e8e;
      color: #8e8e8e;
    }

    .utools-abbreviations .loading::before {
      box-shadow: 9984px 0 0 -5px;
      animation: dot-pulse-before 1.5s infinite linear;
      animation-delay: 0s;
    }

    .utools-abbreviations .loading::after {
      box-shadow: 10014px 0 0 -5px;
      animation: dot-pulse-after 1.5s infinite linear;
      animation-delay: 0.5s;
    }

    @keyframes dot-pulse-before {
      0% {
        box-shadow: 9984px 0 0 -5px;
      }
      30% {
        box-shadow: 9984px 0 0 2px;
      }
      60%, 100% {
        box-shadow: 9984px 0 0 -5px;
      }
    }
    @keyframes dot-pulse {
      0% {
        box-shadow: 9999px 0 0 -5px;
      }
      30% {
        box-shadow: 9999px 0 0 2px;
      }
      60%, 100% {
        box-shadow: 9999px 0 0 -5px;
      }
    }
    @keyframes dot-pulse-after {
      0% {
        box-shadow: 10014px 0 0 -5px;
      }
      30% {
        box-shadow: 10014px 0 0 2px;
      }
      60%, 100% {
        box-shadow: 10014px 0 0 -5px;
      }
    }
  `
}

