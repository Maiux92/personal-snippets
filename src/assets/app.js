function escapeHTML(str) {
  return str.replace(/[&<>"']/g, function(match) {
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return escapeMap[match];
  });
}

const v = new Vue({
    el: '#app',
    data() {
        return {
            snippets: [],
            searchQuery: '',
            currentSortColumn: 'updated_at',
            currentSortDirection: 'desc',
            newSnippet: { title: '', language: 'markdown', content: '' },
            editSnippetData: { id: null, title: '', language: '', content: '' },
            deleteSnippetId: null,
            deleteSnippetTitle: '',
            deleteSnippetLanguage: '',
            formError: {
                title: null
            },
            viewSnippet: {},
            hljsLanguages: hljs.listLanguages()  // Get all available languages from highlight.js
        };
    },
    computed: {
        filteredSnippets() {
            return this.snippets
                .filter(snippet => {
                    return snippet.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                        snippet.content.toLowerCase().includes(this.searchQuery.toLowerCase());
                })
                .sort((a, b) => {
                    const modifier = this.currentSortDirection === 'asc' ? 1 : -1;
                    if (a[this.currentSortColumn] < b[this.currentSortColumn]) {
                        return -1 * modifier;
                    }
                    if (a[this.currentSortColumn] > b[this.currentSortColumn]) {
                        return 1 * modifier;
                    }
                    return 0;
                });
        },
        isTitleDuplicate() {
            this.checkNewTitle();
        },
        isTitleDuplicateEdit() {
            this.checkEditTitle();
        }
    },
    methods: {
        loadSnippets(load_snippet) {
            load_snippet = load_snippet || false;

            $.getJSON('api.php', (data) => {
                this.snippets = data;
                if(load_snippet && window.location.hash) {
                    const snippet_id = parseInt(window.location.hash.replace('#', ''), 10);
                    const snippet = this.snippets.find(e => e.id === snippet_id);
                    if(snippet) {
                        this.showFullSnippet(snippet);
                    }
                }
            });
        },
        handleHashChange() {
            const snippet_id = parseInt(window.location.hash.replace('#', ''), 10);
            const snippet = this.snippets.find(e => e.id === snippet_id);
            if(snippet) {
                this.showFullSnippet(snippet);
            } else {
                this.showHome();
            }
        },
        checkNewTitle() {
            const isDuplicate = this.snippets.some(snippet => snippet.title.toLowerCase() === this.newSnippet.title.toLowerCase());
            if(isDuplicate) {
                this.formError.title = 'A snippet with the same title already exists!';
            } else {
                this.formError.title = '';
            }
            return isDuplicate;
        },
        checkEditTitle() {
            const isDuplicate = this.snippets.some(snippet => snippet.title.toLowerCase() === this.editSnippetData.title.toLowerCase() && snippet.id !== this.editSnippetData.id);
            if(isDuplicate) {
                this.formError.title = 'A snippet with the same title already exists!';
            } else {
                this.formError.title = '';
            }
            return isDuplicate;
        },
        sortSnippets(column) {
            if (this.currentSortColumn === column) {
                this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.currentSortColumn = column;
                this.currentSortDirection = 'asc';
            }
        },
        getSortIcon(column) {
            if (this.currentSortColumn === column) {
                //return this.currentSortDirection === 'asc' ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
                return this.currentSortDirection === 'asc' ? 'fas fa-up-long' : 'fas fa-down-long';
            }
            return '';
        },
        showFullSnippet(snippet) {
            this.viewSnippet = { ...snippet };
            $("#main").addClass('d-none');
            $("#single-snippet").removeClass('d-none');
            setTimeout(() => {
                $("#fullSnippetContent").html('<pre><code class="hljs ' + snippet.language + ' line-numbers">' + escapeHTML(snippet.content) +'</code></pre>');
                hljs.initLineNumbersOnLoad({singleLine: true});
                document.querySelectorAll('pre code').forEach((block) => {
                  hljs.highlightElement(block);
                });
            }, 0);
        },
        showViewModal(snippet) {
            this.viewSnippet = { ...snippet };
            setTimeout(() => {
                $("#content").html('<pre><code class="hljs ' + snippet.language + ' line-numbers">' + escapeHTML(snippet.content) +'</code></pre>');
                hljs.initLineNumbersOnLoad({singleLine: true});
                document.querySelectorAll('pre code').forEach((block) => {
                  hljs.highlightElement(block);
                });
            }, 0);
            $('#viewModal').modal('show');
        },
        showCreateModal() {
            this.checkNewTitle();
            $('#createModal').modal({keyboard: false});
            $('#createModal').modal('show');
        },
        showHome() {
            $('#main').removeClass('d-none');
            $('#single-snippet').addClass('d-none');
        },
        createSnippet() {
            $.ajax({
                url: 'api.php',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(this.newSnippet),
                success: (response) => {
                    if (response.error) {
                        this.formError.title = response.error;
                    } else {
                        this.loadSnippets();
                        $('#createModal').modal('hide');
                        this.showViewModal(this.newSnippet);
                        this.newSnippet = { title: '', language: '', content: '' };
                        this.formError.title = null;
                    }
                }
            });
        },
        showEditModal(snippet) {
            this.editSnippetData = { ...snippet };
            setTimeout(function() {
                updateLineNumbers(document.querySelector('#editTextArea').querySelector('.fancy-textarea'), document.querySelector('#editTextArea').querySelector('.textarea-line-numbers'));
            }, 0);
            $('#editModal').modal({keyboard: false});
            $('#editModal').modal('show');
        },
        editSnippet() {
            $.ajax({
                url: 'api.php',
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(this.editSnippetData),
                success: (response) => {
                    if (response.error) {
                        this.formError.title = response.error;
                    } else {
                        this.loadSnippets();
                        this.formError.title = null;
                        $('#editModal').modal('hide');
                        if($("#main").hasClass('d-none')) {
                            this.showFullSnippet(this.editSnippetData);
                        } else {
                            this.showViewModal(this.editSnippetData);
                        }
                    }
                }
            });
        },
        confirmDelete(snippet) {
            this.deleteSnippetId = snippet.id;
            this.deleteSnippetTitle = snippet.title;
            this.deleteSnippetLanguage = snippet.language;
            $('#deleteModal').modal('show');
        },
        deleteSnippet() {
            $.ajax({
                url: 'api.php',
                method: 'DELETE',
                contentType: 'application/json',
                data: JSON.stringify({ id: this.deleteSnippetId }),
                success: () => {
                    this.loadSnippets();
                    $('#deleteModal').modal('hide');
                    showHome();
                }
            });
        }
    },
    mounted() {
        this.loadSnippets(true);
        window.addEventListener('hashchange', this.handleHashChange)
    }
});

function updateLineNumbers(textarea, lineNumbers) {
  const lines = textarea.value.split('\n').length;
  lineNumbers.innerHTML = '';
  for (let i = 1; i <= lines; i++) {
    lineNumbers.innerHTML += `${i}<br>`;
  }
  lineNumbers.scrollTop = textarea.scrollTop;
}

document.querySelectorAll('.textarea-with-line-numbers').forEach((container) => {
  const textarea = container.querySelector('.fancy-textarea');
  const lineNumbers = container.querySelector('.textarea-line-numbers');

  // Update line numbers on input and scroll events
  textarea.addEventListener('input', () => updateLineNumbers(textarea, lineNumbers));
  textarea.addEventListener('scroll', () => (lineNumbers.scrollTop = textarea.scrollTop));

  // Initialize line numbers
  updateLineNumbers(textarea, lineNumbers);
});

