async function printReport(pages) {
    console.log('Report starting...')
    const sortedPagesArray = sortPagesByCount(pages)

    for (let page of sortedPagesArray) {
        console.log(`Found ${page[1]} internal links to ${page[0]}`)
    }

}

function sortPagesByCount(pages) {
    const pagesArray = Object.entries(pages)

    pagesArray.sort((a, b) => b[1] - a[1])
    return pagesArray
}

export { printReport }