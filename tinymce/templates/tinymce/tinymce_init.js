(function($) {
  function tinymce4_init(selector) {
    var tinymce4_config = {
      {% for key, value in callbacks.items %}
        '{{ key }}': {{ value|safe }},
      {% empty %}
      {% endfor %}
      {{ tinymce_config|safe }}
    };
    if (typeof selector != 'undefined') {
      tinymce4_config['selector'] = selector;
    }
    tinymce.init(tinymce4_config);
  } // End tinymce4_init
{% if not is_admin_inline %}
  tinymce4_init();
})();
{% else %}
  $(function() {
    var inline_group = $('div.inline-group');

    // Use MutationObserver to track adding or removing Django admin inline formsets
    // to add adn remove TinyMCE editor widgets.
    var observer = new MutationObserver(function(mutations) {
      $(mutations).each(function(i, mutation) {
        $(mutation.addedNodes).each(function(i, node) {
          // Add TinyMCE widgets to new textareas.
          $(node).find('.tinymce4-editor').each(function(i, elem) {
            if ($(elem).css('display') != 'none' && elem.id.indexOf('__prefix__') == -1) {
              tinymce4_init(elem.tagName + '#' + elem.id);
            }
          });
        }); // End addedNodes
        $(mutation.removedNodes).each(function(i, node) {
          // Remove TinyMCE widgets from textareas inside removed nodes.
          $(node).find('.tinymce4-editor').each(function(i, elem) {
            $(tinymce.EditorManager.editors).each(function(i, editor) {
              if (editor.id == elem.id) {
                editor.remove();
              }
            });
          });
          // Refresh remaining TinyMCE editors to return them to consistent state
          // After removing an inline formset, Django admin scripts
          // change IDs of remaining textareas,
          // so textarea ID != TinyMCE instance ID attached to it.
          $(tinymce.EditorManager.editors).each(function(i, editor) {
            var elem = editor.getElement();
            if (editor.id != elem.id) {
              editor.remove();
              tinymce4_init(elem.tagName + '#' + elem.id);
            }
          });
        }); // End removedNodes
      }); // End mutations
    }); // End MutationObserver

    observer.observe(inline_group[0], { childList: true, subtree: true });
  }); // End document.ready
})(django.jQuery);
{% endif %}
