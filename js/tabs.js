function tabs() {
    const tabs = document.querySelectorAll("[data-tabs]");
    if (tabs.length > 0) {
        tabs.forEach(((tabsBlock, index) => {
            tabsBlock.classList.add("_tab-init");
            tabsBlock.setAttribute("data-tabs-index", index);
            tabsBlock.addEventListener("click", setTabsAction);
            initTabs(tabsBlock);

            // Добавляем обработчик для кнопки "Подробнее"
            const moreButton = document.querySelector(".top-block-product__more");
            if (moreButton) {
                moreButton.addEventListener("click", (e) => {
                    e.preventDefault();

                    // Находим вкладку "Описание"
                    const descriptionTab = tabsBlock.querySelector('[data-tabs-title]:nth-child(1)');
                    if (descriptionTab) {
                        // Убираем активный класс у текущей активной вкладки
                        const activeTab = tabsBlock.querySelector('[data-tabs-title]._tab-active');
                        if (activeTab) {
                            activeTab.classList.remove("_tab-active");
                        }

                        // Добавляем активный класс вкладке "Описание"
                        descriptionTab.classList.add("_tab-active");

                        // Обновляем состояние вкладок
                        setTabsStatus(tabsBlock);

                        // Прокручиваем страницу к блоку с вкладками
                        tabsBlock.scrollIntoView({ behavior: "smooth" });
                    }
                });
            }
        }));
    }

    function initTabs(tabsBlock) {
        let tabsTitles = tabsBlock.querySelectorAll("[data-tabs-titles]>*");
        let tabsContent = tabsBlock.querySelectorAll("[data-tabs-body]>*");
        if (tabsContent.length) {
            tabsContent = Array.from(tabsContent).filter((item => item.closest("[data-tabs]") === tabsBlock));
            tabsTitles = Array.from(tabsTitles).filter((item => item.closest("[data-tabs]") === tabsBlock));
            tabsContent.forEach(((tabsContentItem, index) => {
                tabsTitles[index].setAttribute("data-tabs-title", "");
                tabsContentItem.setAttribute("data-tabs-item", "");
                tabsContentItem.hidden = !tabsTitles[index].classList.contains("_tab-active");
            }));
        }
    }

    function setTabsStatus(tabsBlock) {
        let tabsTitles = tabsBlock.querySelectorAll("[data-tabs-title]");
        let tabsContent = tabsBlock.querySelectorAll("[data-tabs-item]");
        const tabsBlockIndex = tabsBlock.dataset.tabsIndex;
        function isTabsAnamate(tabsBlock) {
            if (tabsBlock.hasAttribute("data-tabs-animate")) return tabsBlock.dataset.tabsAnimate > 0 ? Number(tabsBlock.dataset.tabsAnimate) : 500;
        }
        const tabsBlockAnimate = isTabsAnamate(tabsBlock);
        if (tabsContent.length > 0) {
            tabsContent = Array.from(tabsContent).filter((item => item.closest("[data-tabs]") === tabsBlock));
            tabsTitles = Array.from(tabsTitles).filter((item => item.closest("[data-tabs]") === tabsBlock));
            tabsContent.forEach(((tabsContentItem, index) => {
                if (tabsTitles[index].classList.contains("_tab-active")) {
                    if (tabsBlockAnimate) _slideDown(tabsContentItem, tabsBlockAnimate); else tabsContentItem.hidden = false;
                } else if (tabsBlockAnimate) _slideUp(tabsContentItem, tabsBlockAnimate); else tabsContentItem.hidden = true;
            }));
        }
    }

    function setTabsAction(e) {
        const el = e.target;
        if (el.closest("[data-tabs-title]")) {
            const tabTitle = el.closest("[data-tabs-title]");
            const tabsBlock = tabTitle.closest("[data-tabs]");
            if (!tabTitle.classList.contains("_tab-active") && !tabsBlock.querySelector("._slide")) {
                let tabActiveTitle = tabsBlock.querySelectorAll("[data-tabs-title]._tab-active");
                tabActiveTitle.length ? tabActiveTitle = Array.from(tabActiveTitle).filter((item => item.closest("[data-tabs]") === tabsBlock)) : null;
                tabActiveTitle.length ? tabActiveTitle[0].classList.remove("_tab-active") : null;
                tabTitle.classList.add("_tab-active");
                setTabsStatus(tabsBlock);
            }
            e.preventDefault();
        }
    }
}
tabs();