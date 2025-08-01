import { useEffect, useRef } from "react";
import { DocumentEditorContainerComponent, Toolbar as DocumentEditorToolbar } from "@syncfusion/ej2-react-documenteditor";
import TitleBar from "./Titlebar";

// Inject the toolbar to the document editor component
DocumentEditorContainerComponent.Inject(DocumentEditorToolbar);

function DocumentEditor({ user, onLogout }) {
  const defaultDocument = '';
  // Configure toolbar items based on user role
  const toolbarConfig = {
    Lawyer: ["New", "Open", "Separator", "Undo", "Redo", "Separator", "Image", "Table", "Hyperlink", "Bookmark", "TableOfContents", "Separator", "Header", "Footer", "PageSetup", "PageNumber", "Break", "InsertFootnote", "InsertEndnote", "Separator", "Find", "Separator", "Comments", "TrackChanges", "LocalClipboard", "RestrictEditing", "Separator", "FormFields", "UpdateFields", "ContentControl", "XML Mapping"],
    Paralegal: ["New", "Open", "Separator", "Undo", "Redo", "Separator", "Image", "Table", "Hyperlink", "Bookmark", "TableOfContents", "Separator", "Header", "Footer", "PageSetup", "PageNumber", "Break", "InsertFootnote", "InsertEndnote", "Separator", "Find", "Separator", "Comments", "TrackChanges", "LocalClipboard", "RestrictEditing", "Separator", "FormFields", "UpdateFields", "ContentControl", "XML Mapping"],
    Client: ["Comments", "Find"],
    Reviewer: ["Comments", "Find", "TrackChanges"],
    Admin: ["New", "Open", "Separator", "Undo", "Redo", "Separator", "Image", "Table", "Hyperlink", "Bookmark", "TableOfContents", "Separator", "Header", "Footer", "PageSetup", "PageNumber", "Break", "InsertFootnote", "InsertEndnote", "Separator", "Find", "Separator", "Comments", "TrackChanges", "LocalClipboard", "RestrictEditing", "Separator", "FormFields", "UpdateFields", "ContentControl", "XML Mapping"]
  };

  // Create references for title bar and container
  const titleBarRef = useRef(null);
  const containerRef = useRef(null);

  // Effect to initialize or update the document editor when the user changes
  useEffect(() => {
    if (user && containerRef.current) {
      convertDocxToSfdt();
      containerRef.current.documentEditor.documentName = "Document";
      containerRef.current.documentEditor.currentUser = user.email;

      // Update document title when changes are made
      containerRef.current.documentChange = () => {
        titleBarRef.current.updateDocumentTitle();
        containerRef.current.documentEditor.focusIn();
      };
      if (!titleBarRef.current) {
        titleBarRef.current = new TitleBar(document.getElementById("documenteditor_titlebar"), containerRef.current.documentEditor, true);
        titleBarRef.current.updateDocumentTitle();
      }
      containerRef.current.toolbarItems = toolbarConfig[user.username];
    }
  }, [user]);

  // Convert GitHub Raw document to SFDT and load in Editor.
  const convertDocxToSfdt = async () => {
    try {
      const docxResponse = await fetch('https://raw.githubusercontent.com/syncfusion/blazor-showcase-document-explorer/master/server/wwwroot/Files/Documents/Giant%20Panda.docx');
      const docxBlob = await docxResponse.blob();

      const formData = new FormData();
      formData.append('files', docxBlob, 'GiantPanda.docx');

      const importResponse = await fetch('https://ej2services.syncfusion.com/production/web-services/api/documenteditor/Import', {
        method: 'POST',
        body: formData,
      });

      if (importResponse.ok) {
        defaultDocument = await importResponse.text();
        containerRef.current.documentEditor.open(defaultDocument);
      } else {
        console.error(`Failed to import document: ${importResponse.statusText}`);
      }
    } catch (error) {
      console.error('Error converting document:', error);
    }
  };

  return (
    <div>
      <div className="main-titlebar" style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", alignItems: "center", background: "#f0f0f0" }}>
        <p className="welcome-text" style={{ margin: 0 }}>Welcome, {user.username || user.email}</p>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
      <div id="documenteditor_titlebar" className="e-de-ctn-title"></div>
      <style>
        {`.e-toolbar-items {
          display: flex !important;
          justify-content: center !important;
        }`}
      </style>
      <DocumentEditorContainerComponent
        ref={containerRef}
        id="container"
        height="calc(100vh - 92px)"
        enableToolbar={true}
      />
    </div>
  );
}

export default DocumentEditor;