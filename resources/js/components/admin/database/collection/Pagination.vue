<!--
  - PhpMongoAdmin (www.phpmongoadmin.com) by Masterforms Mobile & Web (MFMAW)
  - @version      Pagination.vue 1001 6/8/20, 8:58 pm  Gilbert Rehling $
  - @package      PhpMongoAdmin\resources
  - @subpackage   Pagination.vue
  - @link         https://github.com/php-mongo/admin PHP MongoDB Admin
  - @copyright    Copyright (c) 2020. Gilbert Rehling of MMFAW. All rights reserved. (www.mfmaw.com)
  - @licence      PhpMongoAdmin is an Open Source Project released under the GNU GPLv3 license model.
  - @author       Gilbert Rehling:  gilbert@phpmongoadmin.com (www.gilbert-rehling.com)
  -  php-mongo-admin - License conditions:
  -  Contributions to our suggestion box are welcome: https://phpmongotools.com/suggestions
  -  This web application is available as Free Software and has no implied warranty or guarantee of usability.
  -  See licence.txt for the complete licensing outline.
  -  See https://www.gnu.org/licenses/license-list.html for information on GNU General Public License v3.0
  -  See COPYRIGHT.php for copyright notices and further details.
  -->

<style lang="scss">
    @import '~@/abstracts/_variables.scss';

    .pagination-wrapper {
        display: inline-block;
        font-weight: 600;
        width: 99%;

        .page {
            display: inline-block;
            float: left;
        }
        .pagination {
            list-style-type: none;
            float: right;

            .active {
                background-color: $teal;
            }
            .pagination-item {
                display: inline-block;

                button {
                    cursor: pointer;
                }

                button[disabled="disabled"] {
                    &:hover {
                        background-color: transparent;
                    }
                }
            }
        }
    }
</style>
<template>
    <div class="pagination-wrapper">
        <p class="page" v-if="show"><span v-text="showLanguage('collection', 'displaying')"></span> {{ getStart }}  <span>to</span> {{ getEnd }} <span v-text="showLanguage('pagination', 'from')"></span> {{ getTotal }} <span v-text="showLanguage('collection', 'documents')"></span></p>
        <ul class="pagination">
            <li class="pagination-item">
                <button type="button" @click="onClickFirst" :disabled="isInFirstPage" v-text="showLanguage('pagination', 'first')"></button>
            </li>
            <li class="pagination-item pagination-previous">
                <button type="button" @click="onClickPrev" :disabled="isInFirstPage" v-html="showLanguage('pagination', 'previous_')"></button>
            </li>
            <li class="pagination-item" v-for="page in pages" :key="page.name">
                <button type="button" @click="onClickPage(page.name)" :disabled="page.isDisabled" :class="{ active: isPageActive(page.name)}">{{ page.name}}</button>
            </li>
            <li class="pagination-item pagination-next">
                <button type="button" @click="onClickNext" :disabled="isInLastPage" v-html="showLanguage('pagination', 'next_')"></button>
            </li>
            <li class="pagination-item">
                <button type="button" @click="onClickLast" :disabled="isInLastPage" v-text="showLanguage('pagination', 'last')"></button>
            </li>
        </ul>
    </div>
</template>
<script>
        export default {
            /*
            *   The component accepts one db as a property
            */
            props: {
                // define the max number of buttons to display
                maxVisibleButtons: {
                    type: Number,
                    required: false,
                    default: 3
                },
                totalPages: {
                    type: Number,
                    required: true
                },
                total: {
                    type: Number,
                    required: true
                },
                limit: {
                    type: Number,
                    required: true
                },
                currentPage: {
                    type: Number,
                    required: true
                }
            },

            computed: {
                show() {
                    return (this.total > 0);
                },

                /*
                *   Handle the start page value
                */
                startPage() {
                    // when on the first page
                    if (this.currentPage === 1) {
                        return 1;
                    }
                    // need to keep the startPage less than totalPages less maxVisibleButton plus 1 to maintain the correct indexing
                    if ((this.totalPages - this.currentPage) < this.maxVisibleButtons) {
                        return this.totalPages - this.maxVisibleButtons + 1;
                    }
                    // when on the last page !! this will most likely never occur due to the previous check
                    if (this.currentPage === this.totalPages) {
                        return this.totalPages - this.maxVisibleButtons + 1;
                    }
                    // when in between
                    return this.currentPage;
                },

                /*
                *   Page the pages display
                */
                pages() {
                    const range = [];
                    for (let i = this.startPage; i <= Math.min(this.startPage + this.maxVisibleButtons - 1, this.totalPages); i+=1) {
                        range.push({ name: i, isDisabled: i === this.currentPage });
                    }
                    return range;
                },

                getCount() {
                    if (this.total > this.limit) {
                        return this.limit;

                    }
                    return Math.max(this.limit, this.total);
                },

                getStart() {
                    return ((this.currentPage - 1) * this.limit) + 1;
                },

                getEnd() {
                    return Math.min(this.currentPage * this.limit, this.total);
                },

                getTotal() {
                    return this.total;
                },

                isInFirstPage() {
                    return this.currentPage === 1;
                },

                isInLastPage() {
                    return this.currentPage === this.totalPages;
                }
            },

            /*
            *   Define methods for the server component
            */
            methods: {
                /*
                *   Calls the Translation and Language service
                */
                showLanguage(context, key) {
                    return this.$store.getters.getLanguageString(context, key);
                },

                onClickFirst() {
                    this.$emit('pageChanged', 1);
                },

                onClickPrev() {
                    this.$emit('pageChanged', this.currentPage - 1);
                },

                onClickPage(page) {
                    this.$emit('pageChanged', page);
                },

                onClickNext() {
                    this.$emit('pageChanged', this.currentPage + 1);
                },

                onClickLast() {
                    this.$emit('pageChanged', this.totalPages);
                },

                isPageActive(page) {
                    return this.currentPage === page;
                }
            }
        }
</script>
