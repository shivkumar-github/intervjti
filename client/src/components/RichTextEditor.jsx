import { useEditor, EditorContent } from '@tiptap/react'
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react';

const RichTextEditor = ({content, onChange}) => {
	const editor = useEditor({
		extensions: [StarterKit], // define your extension array
		content: content || "", // initial content

		editorProps: {
			attributes: {
				class: "min-h-[200px] border rounded-md p-3 focus:outline-none"
			}
		},

		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		}

	});

	useEffect(() => {
		if (!editor) return;

		if (content !== editor.getHTML()) {
			editor.commands.setContent(content, false);
		}
	}, [content, editor]);

	if (!editor) return null;

	return (
		<>
			<EditorContent editor={editor} />
			{/* <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu> */}
			{/* <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu> */}
		</>
	);
};

export default RichTextEditor;