
<script>
    export let title ="";
    export let modeCaption ="";
    export let option ="";
    </script>
    
    <div class="contents-container">
        <span>{option}</span>
        <span>{modeCaption}</span>
        <p class="mode">{title}</p>
    </div>
    <style>
        .contents-container {
            background-color: #dbdbdb;
            margin-bottom: 51px;
            padding: 21px 46px;
            border-radius: 8px;
            cursor: pointer;
            &:hover{
                background-color: #a5a5a5;
            }
        }
        .contents-container span:first-child {
            font-size: 0.875rem;
        }
        .contents-container span:nth-child(2) {
            float: right;
        }
        .mode {
            font-size: 3rem;
            margin: 47px 0 0 81px;
            line-height: 100%;
        }
    
    </style>